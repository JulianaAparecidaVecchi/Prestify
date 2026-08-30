package br.com.prestify.dto.financial;

import java.math.BigDecimal;

public class FinancialSummaryResponse {

    private final BigDecimal paidIncome;
    private final BigDecimal paidExpense;
    private final BigDecimal profit;

    private final BigDecimal receivable;
    private final BigDecimal payable;

    public FinancialSummaryResponse(
            BigDecimal paidIncome,
            BigDecimal paidExpense,
            BigDecimal profit,
            BigDecimal receivable,
            BigDecimal payable
    ) {
        this.paidIncome = paidIncome;
        this.paidExpense = paidExpense;
        this.profit = profit;
        this.receivable = receivable;
        this.payable = payable;
    }

    public BigDecimal getPaidIncome() {
        return paidIncome;
    }

    public BigDecimal getPaidExpense() {
        return paidExpense;
    }

    public BigDecimal getProfit() {
        return profit;
    }

    public BigDecimal getReceivable() {
        return receivable;
    }

    public BigDecimal getPayable() {
        return payable;
    }
}