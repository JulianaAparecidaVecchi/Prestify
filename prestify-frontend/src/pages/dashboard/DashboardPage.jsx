import authService from '../../services/authService'

import './DashboardPage.css'

function DashboardPage() {
  const user = authService.getUser()

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-welcome-label">
            VISÃO GERAL
          </span>

          <h2>
            Olá,{' '}
            {getFirstName(user?.name)}!
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
            <span>Hoje</span>
            <strong>
              {formatCurrentDate()}
            </strong>
          </div>
        </div>
      </section>

      <section className="dashboard-metrics">
        <MetricCard
          title="Agendamentos hoje"
          value="0"
          description="Nenhum agendamento"
          icon={CalendarIcon}
        />

        <MetricCard
          title="Clientes"
          value="0"
          description="Clientes cadastrados"
          icon={UsersIcon}
        />

        <MetricCard
          title="Serviços realizados"
          value="0"
          description="Neste mês"
          icon={ServicesIcon}
        />

        <MetricCard
          title="Faturamento"
          value="R$ 0,00"
          description="Neste mês"
          icon={WalletIcon}
        />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>
                Próximos agendamentos
              </h3>

              <p>
                Atendimentos previstos
                para hoje
              </p>
            </div>
          </div>

          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">
              <CalendarIcon />
            </div>

            <strong>
              Nenhum agendamento para
              hoje
            </strong>

            <p>
              Quando houver
              agendamentos, eles
              aparecerão aqui.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>
                Resumo financeiro
              </h3>

              <p>
                Movimentações do mês
                atual
              </p>
            </div>
          </div>

          <div className="dashboard-financial-list">
            <FinancialItem
              label="Receitas"
              value="R$ 0,00"
              icon={ArrowUpIcon}
            />

            <FinancialItem
              label="Despesas"
              value="R$ 0,00"
              icon={ArrowDownIcon}
            />

            <FinancialItem
              label="Saldo"
              value="R$ 0,00"
              icon={WalletIcon}
              highlighted
            />
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
        <div>
          <Icon />
        </div>

        <span>{label}</span>
      </div>

      <strong>{value}</strong>
    </div>
  )
}

function getFirstName(name) {
  if (!name) {
    return 'Usuário'
  }

  return name.trim().split(' ')[0]
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  ).format(new Date())
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

function ServicesIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m14 6 4-4 4 4-4 4M4 20l7-7M8 4l12 12" />
      <circle
        cx="6"
        cy="6"
        r="2"
      />
      <circle
        cx="18"
        cy="18"
        r="2"
      />
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

export default DashboardPage