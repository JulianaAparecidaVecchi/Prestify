package br.com.prestify.rules;

import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SystemModule;

import java.math.BigDecimal;

import java.util.EnumSet;
import java.util.Set;

public final class PlanRules {

    private static final int
        UNLIMITED_USERS = -1;

    private PlanRules() {
    }

    public static Set<SystemModule>
        getAllowedModules(
            PlanType plan
        ) {

        PlanType effectivePlan =
            plan == null
                ? PlanType.BASIC
                : plan;

        return switch (
            effectivePlan
        ) {

            case BASIC ->
                EnumSet.of(
                    SystemModule.AGENDA,
                    SystemModule.CLIENTS,
                    SystemModule.SERVICES,
                    SystemModule.USERS
                );

            case PRO ->
                EnumSet.of(
                    SystemModule.AGENDA,
                    SystemModule.CLIENTS,
                    SystemModule.SERVICES,
                    SystemModule.PRODUCTS,
                    SystemModule.STOCK,
                    SystemModule.SUPPLIERS,
                    SystemModule.FINANCIAL,
                    SystemModule.USERS
                );

            case PREMIUM ->
                EnumSet.allOf(
                    SystemModule.class
                );
        };
    }

    public static Set<SystemModule>
        getDefaultModules(
            PlanType plan
        ) {

        /*
         * Ao criar uma empresa,
         * começamos com todos os
         * módulos permitidos pelo plano.
         *
         * Depois o OWNER pode desativar
         * os módulos opcionais nas
         * configurações.
         */
        return getAllowedModules(
            plan
        );
    }

    public static Set<SystemModule>
        normalizeModules(
            PlanType plan,
            Set<SystemModule> modules
        ) {

        Set<SystemModule> allowed =
            getAllowedModules(
                plan
            );

        Set<SystemModule> normalized =
            EnumSet.noneOf(
                SystemModule.class
            );

        if (modules != null) {

            normalized.addAll(
                modules
            );
        }

        /*
         * Remove qualquer módulo que
         * não pertença ao plano.
         */
        normalized.retainAll(
            allowed
        );

        /*
         * Serviços é obrigatório
         * em todos os planos.
         */
        normalized.add(
            SystemModule.SERVICES
        );

        return normalized;
    }

    public static Set<SystemModule>
        getDisallowedModules(
            PlanType plan,
            Set<SystemModule> modules
        ) {

        Set<SystemModule> disallowed =
            EnumSet.noneOf(
                SystemModule.class
            );

        if (modules == null) {
            return disallowed;
        }

        disallowed.addAll(
            modules
        );

        disallowed.removeAll(
            getAllowedModules(
                plan
            )
        );

        return disallowed;
    }

    public static boolean
        isModuleAllowed(
            PlanType plan,
            SystemModule module
        ) {

        if (module == null) {
            return false;
        }

        return getAllowedModules(
            plan
        ).contains(
            module
        );
    }

    public static int
        getMaxActiveUsers(
            PlanType plan
        ) {

        PlanType effectivePlan =
            plan == null
                ? PlanType.BASIC
                : plan;

        return switch (
            effectivePlan
        ) {

            case BASIC -> 3;

            case PRO -> 10;

            case PREMIUM ->
                UNLIMITED_USERS;
        };
    }

    public static boolean
        hasUnlimitedUsers(
            PlanType plan
        ) {

        return getMaxActiveUsers(
            plan
        ) == UNLIMITED_USERS;
    }

    public static boolean
        canAddActiveUser(
            PlanType plan,
            long currentActiveUsers
        ) {

        if (
            hasUnlimitedUsers(
                plan
            )
        ) {

            return true;
        }

        return currentActiveUsers
            < getMaxActiveUsers(
                plan
            );
    }

    public static boolean
        supportsActiveUserCount(
            PlanType plan,
            long activeUsers
        ) {

        if (
            hasUnlimitedUsers(
                plan
            )
        ) {

            return true;
        }

        return activeUsers
            <= getMaxActiveUsers(
                plan
            );
    }

    public static BigDecimal
        getMonthlyPrice(
            PlanType plan
        ) {

        PlanType effectivePlan =
            plan == null
                ? PlanType.BASIC
                : plan;

        return switch (
            effectivePlan
        ) {

            case BASIC ->
                new BigDecimal(
                    "49.90"
                );

            case PRO ->
                new BigDecimal(
                    "99.90"
                );

            case PREMIUM ->
                new BigDecimal(
                    "159.90"
                );
        };
    }

    public static String
        getDisplayName(
            PlanType plan
        ) {

        if (plan == null) {
            return "Básico";
        }

        return switch (plan) {

            case BASIC ->
                "Básico";

            case PRO ->
                "Pro";

            case PREMIUM ->
                "Premium";
        };
    }
}