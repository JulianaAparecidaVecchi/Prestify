import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import reportService from '../../services/reportService'
import authService from '../../services/authService'

import './ReportPage.css'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))

const formatNumber = (value) =>
  new Intl.NumberFormat('pt-BR').format(Number(value || 0))

const formatDate = (value) => {
  if (!value) return '-'

  const [year, month, day] = value.split('-')

  return `${day}/${month}/${year}`
}

const formatShortDate = (value) => {
  if (!value) return ''

  const [, month, day] = value.split('-')

  return `${day}/${month}`
}

const toInputDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getCurrentMonthPeriod = () => {
  const today = new Date()

  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(today),
  }
}

const getLast30DaysPeriod = () => {
  const today = new Date()
  const start = new Date(today)

  start.setDate(start.getDate() - 29)

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(today),
  }
}

const getCurrentYearPeriod = () => {
  const today = new Date()

  const start = new Date(
    today.getFullYear(),
    0,
    1
  )

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(today),
  }
}

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    'Não foi possível carregar o relatório.'
  )
}

const calculatePercentage = (value, total) => {
  const safeValue = Number(value || 0)
  const safeTotal = Number(total || 0)

  if (safeTotal <= 0) return 0

  return (safeValue / safeTotal) * 100
}

function SummaryCard({
  title,
  value,
  subtitle,
  tone = 'default',
}) {
  return (
    <article className={`report-summary-card ${tone}`}>
      <span className="report-summary-label">
        {title}
      </span>

      <strong className="report-summary-value">
        {value}
      </strong>

      {subtitle && (
        <span className="report-summary-subtitle">
          {subtitle}
        </span>
      )}
    </article>
  )
}

function AppointmentMetric({
  label,
  value,
  percentage,
  tone = 'default',
}) {
  return (
    <div className="appointment-metric">
      <div className="appointment-metric-header">
        <div>
          <span className="appointment-metric-label">
            {label}
          </span>

          <strong className="appointment-metric-value">
            {formatNumber(value)}
          </strong>
        </div>

        {percentage !== undefined && (
          <span className={`appointment-percentage ${tone}`}>
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>

      {percentage !== undefined && (
        <div className="appointment-progress">
          <div
            className={`appointment-progress-bar ${tone}`}
            style={{
              width: `${Math.min(
                Math.max(percentage, 0),
                100
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}

function FinancialTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="report-chart-tooltip">
      <strong>{formatDate(label)}</strong>

      {payload.map((item) => (
        <div
          className="report-tooltip-row"
          key={item.dataKey}
        >
          <span>{item.name}</span>
          <strong>
            {formatCurrency(item.value)}
          </strong>
        </div>
      ))}
    </div>
  )
}

function ReportPage() {
  const user = authService.getUser()

  const canAccess =
    user?.role === 'OWNER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER'

  const initialPeriod = useMemo(
    () => getCurrentMonthPeriod(),
    []
  )

  const [filters, setFilters] = useState(initialPeriod)

  const [appliedPeriod, setAppliedPeriod] =
    useState(initialPeriod)

  const [summary, setSummary] = useState(null)
  const [financialSeries, setFinancialSeries] =
    useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReport = useCallback(
    async (period) => {
      if (!canAccess) {
        setLoading(false)
        return
      }

      if (!period.startDate || !period.endDate) {
        setError(
          'Informe a data inicial e a data final.'
        )
        return
      }

      if (period.startDate > period.endDate) {
        setError(
          'A data inicial não pode ser posterior à data final.'
        )
        return
      }

      setLoading(true)
      setError('')

      try {
        const [summaryData, seriesData] =
          await Promise.all([
            reportService.getSummary(
              period.startDate,
              period.endDate
            ),
            reportService.getFinancialSeries(
              period.startDate,
              period.endDate
            ),
          ])

        setSummary(summaryData)
        setFinancialSeries(seriesData || [])
        setAppliedPeriod(period)
      } catch (requestError) {
        setError(getErrorMessage(requestError))
      } finally {
        setLoading(false)
      }
    },
    [canAccess]
  )

  useEffect(() => {
    loadReport(initialPeriod)
  }, [initialPeriod, loadReport])

  const handleFilterChange = (event) => {
    const { name, value } = event.target

    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    loadReport(filters)
  }

  const applyQuickPeriod = (period) => {
    setFilters(period)
    loadReport(period)
  }

  const completedRate = calculatePercentage(
    summary?.completedAppointments,
    summary?.appointments
  )

  const cancelledRate = calculatePercentage(
    summary?.cancelledAppointments,
    summary?.appointments
  )

  const noShowRate = calculatePercentage(
    summary?.noShowAppointments,
    summary?.appointments
  )

  const pendingAppointments = Math.max(
    Number(summary?.appointments || 0) -
      Number(summary?.completedAppointments || 0) -
      Number(summary?.cancelledAppointments || 0) -
      Number(summary?.noShowAppointments || 0),
    0
  )

  const chartData = financialSeries.map((item) => ({
    ...item,
    income: Number(item.income || 0),
    expense: Number(item.expense || 0),
    profit: Number(item.profit || 0),
  }))

  if (!canAccess) {
    return (
      <div className="report-page">
        <section className="report-access-denied">
          <div className="report-access-icon">
            !
          </div>

          <h2>Acesso restrito</h2>

          <p>
            Seu perfil não possui permissão para
            visualizar os relatórios gerenciais.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="report-page">
      <div className="report-page-heading">
        <div>
          <h1>Relatórios</h1>

          <p>
            Acompanhe os principais indicadores do
            negócio em um único lugar.
          </p>
        </div>
      </div>

      <section className="report-filter-card">
        <div className="report-filter-heading">
          <div>
            <h2>Período do relatório</h2>

            <p>
              Selecione o intervalo que deseja
              analisar.
            </p>
          </div>

          {summary && (
            <span className="report-applied-period">
              {formatDate(summary.startDate)}
              {' até '}
              {formatDate(summary.endDate)}
            </span>
          )}
        </div>

        <form
          className="report-filter-form"
          onSubmit={handleSubmit}
        >
          <div className="report-date-field">
            <label htmlFor="report-start-date">
              Data inicial
            </label>

            <input
              id="report-start-date"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              required
            />
          </div>

          <div className="report-date-field">
            <label htmlFor="report-end-date">
              Data final
            </label>

            <input
              id="report-end-date"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              required
            />
          </div>

          <button
            className="report-update-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Atualizando...'
              : 'Atualizar relatório'}
          </button>
        </form>

        <div className="report-quick-periods">
          <span>Períodos rápidos:</span>

          <button
            type="button"
            onClick={() =>
              applyQuickPeriod(
                getCurrentMonthPeriod()
              )
            }
          >
            Este mês
          </button>

          <button
            type="button"
            onClick={() =>
              applyQuickPeriod(
                getLast30DaysPeriod()
              )
            }
          >
            Últimos 30 dias
          </button>

          <button
            type="button"
            onClick={() =>
              applyQuickPeriod(
                getCurrentYearPeriod()
              )
            }
          >
            Este ano
          </button>
        </div>
      </section>

      {error && (
        <div className="report-error">
          <strong>
            Não foi possível carregar o relatório.
          </strong>

          <span>{error}</span>
        </div>
      )}

      {loading && !summary ? (
        <div className="report-loading">
          <div className="report-spinner" />

          <p>Carregando indicadores...</p>
        </div>
      ) : summary ? (
        <>
          <section className="report-section">
            <div className="report-section-heading">
              <div>
                <span className="report-section-eyebrow">
                  Financeiro
                </span>

                <h2>Resumo financeiro</h2>
              </div>

              <span>
                Valores referentes ao período
                selecionado
              </span>
            </div>

            <div className="report-summary-grid">
              <SummaryCard
                title="Receitas recebidas"
                value={formatCurrency(
                  summary.paidIncome
                )}
                subtitle="Valores efetivamente recebidos"
                tone="income"
              />

              <SummaryCard
                title="Despesas pagas"
                value={formatCurrency(
                  summary.paidExpense
                )}
                subtitle="Valores efetivamente pagos"
                tone="expense"
              />

              <SummaryCard
                title="Resultado"
                value={formatCurrency(
                  summary.profit
                )}
                subtitle="Receitas menos despesas"
                tone={
                  Number(summary.profit || 0) >= 0
                    ? 'profit'
                    : 'expense'
                }
              />

              <SummaryCard
                title="A receber"
                value={formatCurrency(
                  summary.receivable
                )}
                subtitle="Receitas pendentes no período"
                tone="receivable"
              />

              <SummaryCard
                title="A pagar"
                value={formatCurrency(
                  summary.payable
                )}
                subtitle="Despesas pendentes no período"
                tone="payable"
              />
            </div>
          </section>

          <section className="report-chart-card">
            <div className="report-section-heading">
              <div>
                <span className="report-section-eyebrow">
                  Evolução
                </span>

                <h2>Movimentação financeira</h2>
              </div>

              <span>
                Receitas e despesas realizadas por
                data de pagamento
              </span>
            </div>

            {chartData.length > 0 ? (
              <div className="report-chart-container">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="incomeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22a06b"
                          stopOpacity={0.22}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22a06b"
                          stopOpacity={0}
                        />
                      </linearGradient>

                      <linearGradient
                        id="expenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#e05a67"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#e05a67"
                          stopOpacity={0}
                        />
                      </linearGradient>

                      <linearGradient
                        id="profitGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#7257d5"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor="#7257d5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#ece9f3"
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{
                        fill: '#777184',
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={28}
                    />

                    <YAxis
                      tickFormatter={(value) =>
                        `R$ ${Number(
                          value
                        ).toLocaleString('pt-BR', {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        })}`
                      }
                      tick={{
                        fill: '#777184',
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={76}
                    />

                    <Tooltip
                      content={<FinancialTooltip />}
                    />

                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={42}
                    />

                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Receitas"
                      stroke="#22a06b"
                      strokeWidth={2.5}
                      fill="url(#incomeGradient)"
                    />

                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Despesas"
                      stroke="#e05a67"
                      strokeWidth={2.5}
                      fill="url(#expenseGradient)"
                    />

                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Resultado"
                      stroke="#7257d5"
                      strokeWidth={2.5}
                      fill="url(#profitGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="report-empty-chart">
                Não há dados financeiros no período.
              </div>
            )}
          </section>

          <div className="report-lower-grid">
            <section className="report-appointments-card">
              <div className="report-section-heading compact">
                <div>
                  <span className="report-section-eyebrow">
                    Agenda
                  </span>

                  <h2>Desempenho dos agendamentos</h2>
                </div>
              </div>

              <div className="appointments-total">
                <span>Total no período</span>

                <strong>
                  {formatNumber(
                    summary.appointments
                  )}
                </strong>
              </div>

              <div className="appointment-metrics-list">
                <AppointmentMetric
                  label="Concluídos"
                  value={
                    summary.completedAppointments
                  }
                  percentage={completedRate}
                  tone="completed"
                />

                <AppointmentMetric
                  label="Cancelados"
                  value={
                    summary.cancelledAppointments
                  }
                  percentage={cancelledRate}
                  tone="cancelled"
                />

                <AppointmentMetric
                  label="Faltas"
                  value={
                    summary.noShowAppointments
                  }
                  percentage={noShowRate}
                  tone="noshow"
                />

                <AppointmentMetric
                  label="Outros status"
                  value={pendingAppointments}
                />
              </div>
            </section>

            <section className="report-current-card">
              <div className="report-section-heading compact">
                <div>
                  <span className="report-section-eyebrow">
                    Visão atual
                  </span>

                  <h2>Situação do negócio</h2>
                </div>
              </div>

              <p className="report-current-description">
                Estes indicadores representam a
                situação atual e não são limitados
                pelo período selecionado.
              </p>

              <div className="report-current-items">
                <div className="report-current-item">
                  <div className="report-current-icon clients">
                    C
                  </div>

                  <div>
                    <span>Clientes ativos</span>

                    <strong>
                      {formatNumber(
                        summary.activeClients
                      )}
                    </strong>
                  </div>
                </div>

                <div className="report-current-item">
                  <div className="report-current-icon stock">
                    E
                  </div>

                  <div>
                    <span>Produtos com estoque baixo</span>

                    <strong>
                      {formatNumber(
                        summary.lowStockProducts
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="report-footer-period">
            Relatório de{' '}
            <strong>
              {formatDate(appliedPeriod.startDate)}
            </strong>{' '}
            até{' '}
            <strong>
              {formatDate(appliedPeriod.endDate)}
            </strong>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default ReportPage