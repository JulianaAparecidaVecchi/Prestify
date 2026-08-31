package br.com.prestify.controller;

import br.com.prestify.dto.platform.PlatformSubscriptionResponse;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;

import br.com.prestify.service.PlatformSubscriptionService;

import org.springframework.data.domain.Page;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
    "/api/platform/subscriptions"
)
@PreAuthorize(
    "hasRole('SUPER_ADMIN')"
)
public class PlatformSubscriptionController {

    private final PlatformSubscriptionService
        platformSubscriptionService;

    public PlatformSubscriptionController(
            PlatformSubscriptionService platformSubscriptionService
    ) {

        this.platformSubscriptionService =
            platformSubscriptionService;
    }

    @GetMapping
    public ResponseEntity<
        Page<PlatformSubscriptionResponse>
    > list(
            @RequestParam(
                defaultValue = ""
            )
            String search,

            @RequestParam(
                required = false
            )
            PlanType plan,

            @RequestParam(
                required = false
            )
            BillingCycle billingCycle,

            @RequestParam(
                required = false
            )
            SubscriptionStatus subscriptionStatus,

            @RequestParam(
                required = false
            )
            Boolean active,

            @RequestParam(
                defaultValue = "0"
            )
            int page,

            @RequestParam(
                defaultValue = "10"
            )
            int size
    ) {

        return ResponseEntity.ok(
            platformSubscriptionService
                .list(
                    search,
                    plan,
                    billingCycle,
                    subscriptionStatus,
                    active,
                    page,
                    size
                )
        );
    }
}