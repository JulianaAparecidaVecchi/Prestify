import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import platformSubscriptionService
  from '../../services/platformSubscriptionService'

import platformDashboardService
  from '../../services/platformDashboardService'

import './PlatformSubscriptionsPage.css'

const PAGE_SIZE = 10

function PlatformSubscriptionsPage() {
  const navigate = useNavigate()

  const [
    subscriptions,
    setSubscriptions,
  ] = useState([])

  const [
    dashboard,
    setDashboard,
  ] = useState(null)

  const [search, setSearch] =
    useState('')

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState('')

  const [plan, setPlan] =
    useState('')

  const [
    billingCycle,
    setBillingCycle,
  ] = useState('')

  const [
    subscriptionStatus,
    setSubscriptionStatus,
  ] = useState('')

  const [
    organizationStatus,
    setOrganizationStatus,
  ] = useState('')

  const [page, setPage] =
    useState(0)

  const [
    totalPages,
    setTotalPages,
  ] = useState(0)

  const [
    totalElements,
    setTotalElements,
  ] = useState(0)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const loadSubscriptions =
    useCallback(async () => {
      try {
        setLoading(true)
        setError('')

        const data =
          await platformSubscriptionService
            .list({
              search:
                appliedSearch,
              plan,
              billingCycle,
              subscriptionStatus,
              active:
                organizationStatus,
              page,
              size: PAGE_SIZE,
            })

        setSubscriptions(
          data.content || []
        )

        setTotalPages(
          data.totalPages || 0
        )

        setTotalElements(
          data.totalElements || 0
        )
      } catch (requestError) {
        const message =
          requestError.response
            ?.data?.message ||
          'Não foi possível carregar as assinaturas.'

        setError(message)
      } finally {
        setLoading(false)
      }
    }, [
      appliedSearch,
      plan,
      billingCycle,
      subscriptionStatus,
      organizationStatus,
      page,
    ])

  const loadDashboard =
    useCallback(async () => {
      try {
        const data =
          await platformDashboardService
            .getDashboard()

        setDashboard(data)
      } catch (requestError) {
        console.error(
          'Não foi possível carregar os indicadores da plataforma.',
          requestError
        )
      }
    }, [])

  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleSearchSubmit = (
    event
  ) => {
    event.preventDefault()

    setPage(0)
    setAppliedSearch(
      search.trim()
    )
  }

  const handleClearFilters = () => {
    setSearch('')
    setAppliedSearch('')
    setPlan('')
    setBillingCycle('')
    setSubscriptionStatus('')
    setOrganizationStatus('')
    setPage(0)
  }

  const handlePlanChange = (
    event
  ) => {
    setPlan(event.target.value)
    setPage(0)
  }

  const handleBillingCycleChange =
    (event) => {
      setBillingCycle(
        event.target.value
      )

      setPage(0)
    }

  const handleSubscriptionStatusChange =
    (event) => {
      setSubscriptionStatus(
        event.target.value
      )

      setPage(0)
    }

  const handleOrganizationStatusChange =
    (event) => {
      setOrganizationStatus(
        event.target.value
      )

      setPage(0)
    }

  const hasFilters =
    appliedSearch ||
    plan ||
    billingCycle ||
    subscriptionStatus ||
    organizationStatus !== ''

  const startItem =
    totalElements === 0
      ? 0
      : page * PAGE_SIZE + 1

  const endItem =
    Math.min(
      (page + 1) * PAGE_SIZE,
      totalElements
    )

  return (
    <div className="platform-subscriptions-page">
      <section className="platform-subscriptions-intro">
        <div>
          <span className="platform-subscriptions-eyebrow">
            Gestão comercial
          </span>

          <h2>
            Assinaturas e planos
          </h2>

          <p>
            Acompanhe os planos,
            ciclos de cobrança e
            próximas cobranças das
            empresas clientes.
          </p>
        </div>

        <button
          type="button"
          className="platform-subscriptions-organizations-button"
          onClick={() =>
            navigate(
              '/platform/organizations'
            )
          }
        >
          Gerenciar empresas
        </button>
      </section>

      <section className="platform-subscriptions-metrics">
        <MetricCard
          label="Assinaturas ativas"
          value={
            dashboard
              ?.activeSubscriptions ??
            0
          }
          description="Empresas ativas com assinatura ativa"
        />

        <MetricCard
          label="Receita mensal estimada"
          value={formatCurrency(
            dashboard
              ?.estimatedMonthlyRevenue ??
              0
          )}
          description="MRR estimado da plataforma"
        />

        <MetricCard
          label="Plano Pro"
          value={
            dashboard
              ?.proOrganizations ??
            0
          }
          description="Empresas no plano Pro"
        />

        <MetricCard
          label="Plano Premium"
          value={
            dashboard
              ?.premiumOrganizations ??
            0
          }
          description="Empresas no plano Premium"
        />
      </section>

      <section className="platform-subscriptions-panel">
        <div className="platform-subscriptions-panel-header">
          <div>
            <h3>
              Assinaturas
            </h3>

            <p>
              {totalElements}{' '}
              {totalElements === 1
                ? 'empresa encontrada'
                : 'empresas encontradas'}
            </p>
          </div>
        </div>

        <div className="platform-subscriptions-filters">
          <form
            className="platform-subscriptions-search"
            onSubmit={
              handleSearchSubmit
            }
          >
            <SearchIcon />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar empresa, CNPJ ou e-mail"
              aria-label="Buscar assinaturas"
            />

            <button type="submit">
              Buscar
            </button>
          </form>

          <div className="platform-subscriptions-selects">
            <select
              value={plan}
              onChange={
                handlePlanChange
              }
              aria-label="Filtrar por plano"
            >
              <option value="">
                Todos os planos
              </option>

              <option value="BASIC">
                Básico
              </option>

              <option value="PRO">
                Pro
              </option>

              <option value="PREMIUM">
                Premium
              </option>
            </select>

            <select
              value={billingCycle}
              onChange={
                handleBillingCycleChange
              }
              aria-label="Filtrar por ciclo"
            >
              <option value="">
                Todos os ciclos
              </option>

              <option value="MONTHLY">
                Mensal
              </option>

              <option value="YEARLY">
                Anual
              </option>
            </select>

            <select
              value={
                subscriptionStatus
              }
              onChange={
                handleSubscriptionStatusChange
              }
              aria-label="Filtrar por assinatura"
            >
              <option value="">
                Todos os status
              </option>

              <option value="ACTIVE">
                Ativa
              </option>

              <option value="TRIAL">
                Período de teste
              </option>

              <option value="PAST_DUE">
                Em atraso
              </option>

              <option value="CANCELLED">
                Cancelada
              </option>
            </select>

            <select
              value={
                organizationStatus
              }
              onChange={
                handleOrganizationStatusChange
              }
              aria-label="Filtrar por empresa"
            >
              <option value="">
                Todas as empresas
              </option>

              <option value="true">
                Empresas ativas
              </option>

              <option value="false">
                Empresas suspensas
              </option>
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              className="platform-subscriptions-clear-button"
              onClick={
                handleClearFilters
              }
            >
              Limpar filtros
            </button>
          )}
        </div>

        {error && (
          <div
            className="platform-subscriptions-error"
            role="alert"
          >
            {error}

            <button
              type="button"
              onClick={
                loadSubscriptions
              }
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="platform-subscriptions-state">
            <div className="platform-subscriptions-spinner" />

            <strong>
              Carregando assinaturas...
            </strong>
          </div>
        )}

        {!error &&
          !loading &&
          subscriptions.length ===
            0 && (
            <div className="platform-subscriptions-state">
              <div className="platform-subscriptions-empty-icon">
                <CardIcon />
              </div>

              <strong>
                Nenhuma assinatura
                encontrada
              </strong>

              <p>
                Altere os filtros ou
                cadastre uma nova
                empresa na plataforma.
              </p>
            </div>
          )}

        {!error &&
          !loading &&
          subscriptions.length >
            0 && (
            <>
              <div className="platform-subscriptions-table-wrapper">
                <table className="platform-subscriptions-table">
                  <thead>
                    <tr>
                      <th>
                        Empresa
                      </th>

                      <th>
                        Plano
                      </th>

                      <th>
                        Ciclo
                      </th>

                      <th>
                        Valor
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Próxima cobrança
                      </th>

                      <th>
                        Usuários
                      </th>

                      <th>
                        Empresa
                      </th>

                      <th>
                        Ação
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {subscriptions.map(
                      (
                        subscription
                      ) => (
                        <tr
                          key={
                            subscription
                              .organizationId
                          }
                        >
                          <td>
                            <div className="platform-subscription-company">
                              <div className="platform-subscription-company-icon">
                                <BuildingIcon />
                              </div>

                              <div>
                                <strong>
                                  {
                                    subscription
                                      .organizationName
                                  }
                                </strong>

                                <span>
                                  {subscription
                                    .email ||
                                    formatDocument(
                                      subscription
                                        .document
                                    ) ||
                                    'Sem e-mail cadastrado'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`platform-subscription-plan platform-subscription-plan-${(
                                subscription.plan ||
                                'basic'
                              ).toLowerCase()}`}
                            >
                              {formatPlan(
                                subscription.plan
                              )}
                            </span>
                          </td>

                          <td>
                            {formatBillingCycle(
                              subscription.billingCycle
                            )}
                          </td>

                          <td>
                            <div className="platform-subscription-price">
                              <strong>
                                {formatCurrency(
                                  subscription.price
                                )}
                              </strong>

                              <span>
                                {subscription.billingCycle ===
                                'YEARLY'
                                  ? `${formatCurrency(
                                      subscription.monthlyEquivalent
                                    )}/mês equivalente`
                                  : 'por mês'}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`platform-subscription-status platform-subscription-status-${(
                                subscription.subscriptionStatus ||
                                'unknown'
                              ).toLowerCase()}`}
                            >
                              {formatSubscriptionStatus(
                                subscription.subscriptionStatus
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="platform-subscription-date">
                              <strong>
                                {formatDate(
                                  subscription.nextBillingDate
                                )}
                              </strong>

                              <span>
                                {getBillingDateDescription(
                                  subscription.nextBillingDate
                                )}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="platform-subscription-users">
                              {subscription.activeUsers ??
                                0}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`platform-subscription-organization-status ${
                                subscription.organizationActive
                                  ? 'platform-subscription-organization-active'
                                  : 'platform-subscription-organization-inactive'
                              }`}
                            >
                              <span />

                              {subscription.organizationActive
                                ? 'Ativa'
                                : 'Suspensa'}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="platform-subscription-action"
                              onClick={() =>
                                navigate(
                                  `/platform/organizations?edit=${subscription.organizationId}`
                                )
                              }
                            >
                              Gerenciar
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="platform-subscriptions-pagination">
                <span>
                  Exibindo{' '}
                  <strong>
                    {startItem}
                  </strong>
                  {' - '}
                  <strong>
                    {endItem}
                  </strong>
                  {' de '}
                  <strong>
                    {totalElements}
                  </strong>
                </span>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.max(
                            current -
                              1,
                            0
                          )
                      )
                    }
                    disabled={
                      page === 0
                    }
                  >
                    Anterior
                  </button>

                  <span>
                    Página{' '}
                    {totalPages === 0
                      ? 0
                      : page + 1}{' '}
                    de{' '}
                    {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.min(
                            current +
                              1,
                            totalPages -
                              1
                          )
                      )
                    }
                    disabled={
                      totalPages ===
                        0 ||
                      page >=
                        totalPages -
                          1
                    }
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </>
          )}
      </section>
    </div>
  )
}

function MetricCard({
  label,
  value,
  description,
}) {
  return (
    <article className="platform-subscriptions-metric-card">
      <div className="platform-subscriptions-metric-icon">
        <CardIcon />
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <p>
          {description}
        </p>
      </div>
    </article>
  )
}

function formatCurrency(value) {
  const number =
    Number(value || 0)

  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  ).format(number)
}

function formatPlan(plan) {
  const plans = {
    BASIC: 'Básico',
    PRO: 'Pro',
    PREMIUM: 'Premium',
  }

  return plans[plan] || plan || '-'
}

function formatBillingCycle(
  billingCycle
) {
  const cycles = {
    MONTHLY: 'Mensal',
    YEARLY: 'Anual',
  }

  return (
    cycles[billingCycle] ||
    billingCycle ||
    '-'
  )
}

function formatSubscriptionStatus(
  status
) {
  const statuses = {
    ACTIVE: 'Ativa',
    TRIAL: 'Teste',
    PAST_DUE: 'Em atraso',
    CANCELLED: 'Cancelada',
  }

  return (
    statuses[status] ||
    status ||
    '-'
  )
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const [
    year,
    month,
    day,
  ] = value.split('-')

  if (
    !year ||
    !month ||
    !day
  ) {
    return value
  }

  return `${day}/${month}/${year}`
}

function getBillingDateDescription(
  value
) {
  if (!value) {
    return 'Sem data definida'
  }

  const today =
    new Date()

  today.setHours(
    0,
    0,
    0,
    0
  )

  const [
    year,
    month,
    day,
  ] = value
    .split('-')
    .map(Number)

  const billingDate =
    new Date(
      year,
      month - 1,
      day
    )

  billingDate.setHours(
    0,
    0,
    0,
    0
  )

  const difference =
    Math.round(
      (
        billingDate.getTime() -
        today.getTime()
      ) /
        86400000
    )

  if (difference === 0) {
    return 'Hoje'
  }

  if (difference === 1) {
    return 'Amanhã'
  }

  if (difference > 1) {
    return `Em ${difference} dias`
  }

  if (difference === -1) {
    return '1 dia em atraso'
  }

  return `${Math.abs(
    difference
  )} dias em atraso`
}

function formatDocument(
  document
) {
  if (!document) {
    return ''
  }

  const digits =
    document.replace(
      /\D/g,
      ''
    )

  if (
    digits.length !== 14
  ) {
    return document
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m16.5 16.5 5 5" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="M3 10h18M7 15h4" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 21V5l7-3 7 3v16M3 21h18M9 8h2M14 8h2M9 12h2M14 12h2M9 16h2M14 16h2" />
    </svg>
  )
}

export default PlatformSubscriptionsPage