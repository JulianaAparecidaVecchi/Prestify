package br.com.prestify.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FinancialSeriesResponse {

    private final LocalDate date;
    private final BigDecimal income;
    private final BigDecimal expense;
    private final BigDecimal profit;

    public FinancialSeriesResponse(
            LocalDate date,
            BigDecimal income,
            BigDecimal expense
    ) {
        this.date = date;
        this.income = income;
        this.expense = expense;
        this.profit = income.subtract(expense);
    }

    public LocalDate getDate() {
        return date;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public BigDecimal getExpense() {
        return expense;
    }

    public BigDecimal getProfit() {
        return profit;
    }
}