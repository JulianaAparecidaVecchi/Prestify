import {
  useEffect,
  useState,
} from 'react'

import authService
  from '../../services/authService'

import dashboardService
  from '../../services/dashboardService'

import './DashboardPage.css'

function DashboardPage() {
  const user =
    authService.getUser()

  const [dashboard, setDashboard] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard =
    async () => {
      try {
        setLoading(true)
        setError('')

        const data =
          await dashboardService
            .getDashboard()

        setDashboard(data)
      } catch (requestError) {
        console.error(
          'Erro ao carregar dashboard:',
          requestError
        )

        setError(
          getErrorMessage(
            requestError
          )
        )
      } finally {
        setLoading(false)
      }
    }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />

          <p>
            Carregando informações...
          </p>
        </div>
      </div>
    )
  }

  if (
    error &&
    !dashboard
  ) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="dashboard-error-icon">
            <WarningIcon />
          </div>

          <h2>
            Não foi possível carregar
            o Dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadDashboard
            }
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const appointmentsToday =
    dashboard?.appointmentsToday ?? 0

  const activeClients =
    dashboard?.activeClients ?? 0

  const paidIncome =
    Number(
      dashboard?.paidIncome ?? 0
    )

  const paidExpense =
    Number(
      dashboard?.paidExpense ?? 0
    )

  const profit =
    Number(
      dashboard?.profit ?? 0
    )

  const lowStockProducts =
    dashboard?.lowStockProducts ?? 0

  const recentActivities =
    dashboard?.recentActivities ?? []

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-welcome-label">
            VISÃO GERAL
          </span>

          <h2>
            Olá,{' '}
            {getFirstName(
              user?.name
            )}!
          </h2>

          <p>
            Aqui está um resumo do que
            está acontecendo no seu
            negócio.
          </p>
        </div>

        <div className="dashboard-date">
          <CalendarIcon />

          <div>
            <span>
              Hoje
            </span>

            <strong>
              {formatCurrentDate()}
            </strong>
          </div>
        </div>
      </section>

      {error && (
        <div className="dashboard-alert">
          {error}
        </div>
      )}

      <section className="dashboard-metrics">
        <MetricCard
          title="Agendamentos hoje"
          value={
            appointmentsToday
          }
          description={
            getAppointmentsDescription(
              appointmentsToday
            )
          }
          icon={
            CalendarIcon
          }
        />

        <MetricCard
          title="Clientes ativos"
          value={
            activeClients
          }
          description={
            getClientsDescription(
              activeClients
            )
          }
          icon={
            UsersIcon
          }
        />

        <MetricCard
          title="Faturamento"
          value={
            formatCurrency(
              paidIncome
            )
          }
          description="Receitas pagas neste mês"
          icon={
            WalletIcon
          }
        />

        <MetricCard
          title="Estoque baixo"
          value={
            lowStockProducts
          }
          description={
            getLowStockDescription(
              lowStockProducts
            )
          }
          icon={
            StockIcon
          }
        />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>
                Atividades recentes
              </h3>

              <p>
                Últimas movimentações
                registradas no sistema
              </p>
            </div>

            <button
              type="button"
              className="dashboard-refresh-button"
              onClick={
                loadDashboard
              }
              title="Atualizar Dashboard"
            >
              <RefreshIcon />
            </button>
          </div>

          {recentActivities.length ===
          0 ? (
            <div className="dashboard-empty-state">
              <div className="dashboard-empty-icon">
                <ActivityIcon />
              </div>

              <strong>
                Nenhuma atividade recente
              </strong>

              <p>
                As movimentações de
                agendamentos, financeiro
                e estoque aparecerão
                aqui.
              </p>
            </div>
          ) : (
            <div className="dashboard-activity-list">
              {recentActivities.map(
                (
                  activity,
                  index
                ) => (
                  <ActivityItem
                    key={`${activity.type}-${activity.dateTime}-${index}`}
                    activity={
                      activity
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>
                Resumo financeiro
              </h3>

              <p>
                Movimentações pagas do
                mês atual
              </p>
            </div>
          </div>

          <div className="dashboard-financial-list">
            <FinancialItem
              label="Receitas"
              value={
                formatCurrency(
                  paidIncome
                )
              }
              icon={
                ArrowUpIcon
              }
              type="income"
            />

            <FinancialItem
              label="Despesas"
              value={
                formatCurrency(
                  paidExpense
                )
              }
              icon={
                ArrowDownIcon
              }
              type="expense"
            />

            <FinancialItem
              label="Saldo"
              value={
                formatCurrency(
                  profit
                )
              }
              icon={
                WalletIcon
              }
              highlighted
              type={
                profit >= 0
                  ? 'income'
                  : 'expense'
              }
            />
          </div>

          <div className="dashboard-financial-summary">
            <div className="dashboard-financial-summary-header">
              <span>
                Resultado do mês
              </span>

              <strong
                className={
                  profit >= 0
                    ? 'dashboard-positive'
                    : 'dashboard-negative'
                }
              >
                {formatCurrency(
                  profit
                )}
              </strong>
            </div>

            <div className="dashboard-financial-bar">
              <div
                className="dashboard-financial-bar-income"
                style={{
                  width:
                    getIncomePercentage(
                      paidIncome,
                      paidExpense
                    ),
                }}
              />
            </div>

            <div className="dashboard-financial-legend">
              <span>
                Receitas
              </span>

              <span>
                Despesas
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="dashboard-metric-card">
      <div className="dashboard-metric-top">
        <div className="dashboard-metric-icon">
          <Icon />
        </div>
      </div>

      <span className="dashboard-metric-title">
        {title}
      </span>

      <strong className="dashboard-metric-value">
        {value}
      </strong>

      <span className="dashboard-metric-description">
        {description}
      </span>
    </div>
  )
}

function FinancialItem({
  label,
  value,
  icon: Icon,
  highlighted = false,
  type,
}) {
  return (
    <div
      className={`dashboard-financial-item ${
        highlighted
          ? 'dashboard-financial-item-highlighted'
          : ''
      }`}
    >
      <div className="dashboard-financial-label">
        <div
          className={`dashboard-financial-icon dashboard-financial-icon-${type}`}
        >
          <Icon />
        </div>

        <span>
          {label}
        </span>
      </div>

      <strong
        className={
          type === 'income'
            ? 'dashboard-positive'
            : type === 'expense'
              ? 'dashboard-negative'
              : ''
        }
      >
        {value}
      </strong>
    </div>
  )
}

function ActivityItem({
  activity,
}) {
  const activityConfig =
    getActivityConfig(
      activity.type
    )

  const Icon =
    activityConfig.icon

  return (
    <div className="dashboard-activity-item">
      <div
        className={`dashboard-activity-icon dashboard-activity-icon-${activityConfig.className}`}
      >
        <Icon />
      </div>

      <div className="dashboard-activity-content">
        <div className="dashboard-activity-header">
          <strong>
            {activity.title}
          </strong>

          <span>
            {formatActivityDate(
              activity.dateTime
            )}
          </span>
        </div>

        <p>
          {formatActivityDescription(
            activity
          )}
        </p>
      </div>
    </div>
  )
}

function getActivityConfig(
  type
) {
  switch (type) {
    case 'APPOINTMENT':
      return {
        icon:
          CalendarIcon,

        className:
          'appointment',
      }

    case 'FINANCIAL':
      return {
        icon:
          WalletIcon,

        className:
          'financial',
      }

    case 'STOCK':
      return {
        icon:
          StockIcon,

        className:
          'stock',
      }

    default:
      return {
        icon:
          ActivityIcon,

        className:
          'default',
      }
  }
}

function formatActivityDescription(
  activity
) {
  if (
    !activity?.description
  ) {
    return ''
  }

  return activity.description
}

function getAppointmentsDescription(
  count
) {
  if (count === 0) {
    return 'Nenhum agendamento hoje'
  }

  if (count === 1) {
    return '1 atendimento previsto'
  }

  return `${count} atendimentos previstos`
}

function getClientsDescription(
  count
) {
  if (count === 0) {
    return 'Nenhum cliente ativo'
  }

  if (count === 1) {
    return '1 cliente cadastrado'
  }

  return `${count} clientes cadastrados`
}

function getLowStockDescription(
  count
) {
  if (count === 0) {
    return 'Estoque dentro do esperado'
  }

  if (count === 1) {
    return '1 produto requer atenção'
  }

  return `${count} produtos requerem atenção`
}

function getIncomePercentage(
  income,
  expense
) {
  const total =
    income + expense

  if (total <= 0) {
    return '50%'
  }

  const percentage =
    (income / total) * 100

  return `${Math.max(
    0,
    Math.min(
      percentage,
      100
    )
  )}%`
}

function getFirstName(
  name
) {
  if (!name) {
    return 'Usuário'
  }

  return name
    .trim()
    .split(' ')[0]
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  ).format(
    new Date()
  )
}

function formatCurrency(
  value
) {
  return Number(
    value || 0
  ).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )
}

function formatActivityDate(
  value
) {
  if (!value) {
    return ''
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  const now =
    new Date()

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

  const activityDay =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )

  const difference =
    Math.round(
      (
        today -
        activityDay
      ) /
      86400000
    )

  const time =
    date.toLocaleTimeString(
      'pt-BR',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )

  if (difference === 0) {
    return `Hoje, ${time}`
  }

  if (difference === 1) {
    return `Ontem, ${time}`
  }

  return date.toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  )
}

function getErrorMessage(
  error
) {
  if (
    error.response?.status ===
    403
  ) {
    return 'Seu usuário não possui permissão para visualizar o Dashboard.'
  }

  if (
    error.response?.status ===
    401
  ) {
    return 'Sua sessão expirou. Faça login novamente.'
  }

  return (
    error.response?.data
      ?.message ||
    'Não foi possível carregar os dados do Dashboard.'
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M7 2v3M17 2v3M3 9h18" />

      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
      />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="9"
        cy="8"
        r="4"
      />

      <path d="M2 21c.4-4.5 2.8-7 7-7s6.6 2.5 7 7M16 5a4 4 0 0 1 0 7M17 14c3 .5 4.7 2.8 5 6" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13" />

      <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" />
    </svg>
  )
}

function StockIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m4 7 8-4 8 4-8 4-8-4Z" />

      <path d="m4 7v10l8 4 8-4V7M12 11v10" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m6 15 6-6 6 6M12 9v11" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6M12 4v11" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20 11a8 8 0 1 0-2 5.5" />

      <path d="M20 4v7h-7" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 2.5 20h19L12 3Z" />

      <path d="M12 9v5M12 17h.01" />
    </svg>
  )
}

export default DashboardPage