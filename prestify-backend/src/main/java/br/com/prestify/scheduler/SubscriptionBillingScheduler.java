package br.com.prestify.scheduler;

import br.com.prestify.service.SubscriptionBillingService;

import java.time.LocalDate;
import java.time.ZoneId;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.scheduling.annotation.Scheduled;

import org.springframework.stereotype.Component;

@Component
public class SubscriptionBillingScheduler {

    private static final Logger LOGGER =
        LoggerFactory.getLogger(
            SubscriptionBillingScheduler.class
        );

    private static final ZoneId
        BILLING_ZONE =
            ZoneId.of(
                "America/Sao_Paulo"
            );

    private final
        SubscriptionBillingService
            subscriptionBillingService;

    public SubscriptionBillingScheduler(
            SubscriptionBillingService subscriptionBillingService
    ) {

        this.subscriptionBillingService =
            subscriptionBillingService;
    }

    /*
     * Executa diariamente às 03:00
     * no horário de São Paulo.
     *
     * second minute hour day month weekday
     *
     * 0 0 3 * * *
     */
    @Scheduled(
        cron = "0 0 3 * * *",
        zone = "America/Sao_Paulo"
    )
    public void processSubscriptions() {

        LocalDate today =
            LocalDate.now(
                BILLING_ZONE
            );

        LOGGER.info(
            "Iniciando processamento recorrente de assinaturas. Data: {}",
            today
        );

        List<Long> organizationIds =
            subscriptionBillingService
                .findDueOrganizationIds(
                    today
                );

        int organizationsProcessed =
            0;

        int chargesProcessed =
            0;

        int errors =
            0;

        for (
            Long organizationId :
            organizationIds
        ) {

            try {

                int charges =
                    subscriptionBillingService
                        .processOrganization(
                            organizationId,
                            today
                        );

                if (charges > 0) {

                    organizationsProcessed++;

                    chargesProcessed +=
                        charges;
                }

            } catch (
                Exception exception
            ) {

                errors++;

                LOGGER.error(
                    "Erro ao processar cobrança recorrente da organização {}.",
                    organizationId,
                    exception
                );
            }
        }

        LOGGER.info(
            "Processamento de assinaturas concluído. Empresas encontradas: {}. Empresas processadas: {}. Cobranças processadas: {}. Erros: {}.",
            organizationIds.size(),
            organizationsProcessed,
            chargesProcessed,
            errors
        );
    }
}