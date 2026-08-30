package br.com.prestify.controller;

import br.com.prestify.dto.report.FinancialSeriesResponse;
import br.com.prestify.dto.report.ReportSummaryResponse;

import br.com.prestify.service.ReportService;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(
            ReportService reportService
    ) {
        this.reportService =
            reportService;
    }

    @GetMapping("/summary")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ReportSummaryResponse getSummary(

            @RequestParam
            LocalDate startDate,

            @RequestParam
            LocalDate endDate

    ) {

        return reportService.getSummary(
            startDate,
            endDate
        );
    }

    @GetMapping("/financial-series")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public List<FinancialSeriesResponse>
        getFinancialSeries(

            @RequestParam
            LocalDate startDate,

            @RequestParam
            LocalDate endDate

        ) {

        return reportService
            .getFinancialSeries(
                startDate,
                endDate
            );
    }
}