import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import authService
  from '../../services/authService'

import platformDashboardService
  from '../../services/platformDashboardService'

import platformOrganizationService
  from '../../services/platformOrganizationService'

import './PlatformDashboardPage.css'

function PlatformDashboardPage() {
  const navigate =
    useNavigate()

  const user =
    authService.getUser()

  const [
    dashboard,
    setDashboard,
  ] = useState(null)

  const [
    recentOrganizations,
    setRecentOrganizations,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  useEffect(
    () => {
      loadDashboard()
    },
    []
  )

  const loadDashboard =
    async () => {
      try {
        setLoading(true)
        setError('')

        const [
          dashboardData,
          organizationsData,
        ] =
          await Promise.all([
            platformDashboardService
              .getDashboard(),

            platformOrganizationService
              .list({
                search: '',
                active: null,
                page: 0,
                size: 5,
              }),
          ])

        setDashboard(
          dashboardData
        )

        setRecentOrganizations(
          organizationsData
            ?.content || []
        )

      } catch (requestError) {
        console.error(
          'Erro ao carregar dashboard da plataforma:',
          requestError
        )

        setError(
          'Não foi possível carregar os dados da plataforma.'
        )

      } finally {
        setLoading(false)
      }
    }

  const formatCurrency =
    (value) => {
      return new Intl
        .NumberFormat(
          'pt-BR',
          {
            style: 'currency',
            currency: 'BRL',
          }
        )
        .format(
          Number(value || 0)
        )
    }

  const formatPlan =
    (plan) => {
      const labels = {
        BASIC: 'Básico',
        PRO: 'Pro',
        PREMIUM: 'Premium',
      }

      return (
        labels[plan] ||
        plan ||
        '-'
      )
    }

  const planData =
    useMemo(
      () => [
        {
          key: 'BASIC',
          name: 'Básico',
          value:
            dashboard
              ?.basicOrganizations ??
            0,
        },
        {
          key: 'PRO',
          name: 'Pro',
          value:
            dashboard
              ?.proOrganizations ??
            0,
        },
        {
          key: 'PREMIUM',
          name: 'Premium',
          value:
            dashboard
              ?.premiumOrganizations ??
            0,
        },
      ],
      [dashboard]
    )

  const maxPlanValue =
    useMemo(
      () => {
        const max =
          Math.max(
            ...planData.map(
              (item) =>
                item.value
            ),
            1
          )

        return max
      },
      [planData]
    )

  const activePercentage =
    dashboard
      ?.totalOrganizations > 0
      ? Math.round(
          (
            dashboard
              .activeOrganizations /
            dashboard
              .totalOrganizations
          ) * 100
        )
      : 0

  if (loading) {
    return (
      <div className="platform-dashboard">
        <section className="platform-loading-card">
          <div className="platform-loading-spinner" />

          <div>
            <h2>
              Carregando visão geral
            </h2>

            <p>
              Buscando os indicadores
              atuais da plataforma.
            </p>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="platform-dashboard">
        <section className="platform-error-card">
          <div className="platform-error-icon">
            <AlertIcon />
          </div>

          <div>
            <h2>
              Não foi possível carregar
              a visão geral
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
        </section>
      </div>
    )
  }

  return (
    <div className="platform-dashboard">
      <section className="platform-dashboard-header">
        <div>
          <span className="platform-eyebrow">
            VISÃO GERAL
          </span>

          <h2>
            Administração da plataforma
          </h2>

          <p>
            Acompanhe empresas,
            assinaturas, usuários e
            receita estimada do Prestify.
          </p>
        </div>

        <button
          type="button"
          className="platform-primary-action"
          onClick={
            () =>
              navigate(
                '/platform/organizations'
              )
          }
        >
          <PlusIcon />

          Nova empresa
        </button>
      </section>

      <section className="platform-kpi-grid">
        <KpiCard
          icon={
            <BuildingIcon />
          }
          label="Empresas"
          value={
            dashboard
              ?.totalOrganizations ??
            0
          }
          description={
            `${dashboard
              ?.activeOrganizations ??
              0} ativas · ${dashboard
              ?.inactiveOrganizations ??
              0} inativas`
          }
        />

        <KpiCard
          icon={
            <SubscriptionIcon />
          }
          label="Assinaturas ativas"
          value={
            dashboard
              ?.activeSubscriptions ??
            0
          }
          description="Assinaturas atualmente ativas"
        />

        <KpiCard
          icon={
            <AdminIcon />
          }
          label="Usuários ativos"
          value={
            dashboard
              ?.activeUsers ??
            0
          }
          description="Usuários das empresas clientes"
        />

        <KpiCard
          icon={
            <RevenueIcon />
          }
          label="Receita mensal estimada"
          value={
            formatCurrency(
              dashboard
                ?.estimatedMonthlyRevenue
            )
          }
          description="MRR aproximado das assinaturas"
          highlight
        />
      </section>

      <section className="platform-dashboard-main-grid">
        <article className="platform-panel platform-plan-panel">
          <div className="platform-panel-header">
            <div>
              <span className="platform-panel-label">
                PLANOS
              </span>

              <h3>
                Distribuição das empresas
              </h3>

              <p>
                Quantidade de clientes
                cadastrados em cada plano.
              </p>
            </div>

            <PlanIcon />
          </div>

          <div className="platform-plan-list">
            {
              planData.map(
                (plan) => {
                  const percentage =
                    Math.round(
                      (
                        plan.value /
                        maxPlanValue
                      ) * 100
                    )

                  return (
                    <div
                      className="platform-plan-row"
                      key={plan.key}
                    >
                      <div className="platform-plan-row-top">
                        <div>
                          <strong>
                            {plan.name}
                          </strong>

                          <span>
                            {
                              plan.value
                            }{' '}
                            {
                              plan.value ===
                              1
                                ? 'empresa'
                                : 'empresas'
                            }
                          </span>
                        </div>

                        <strong className="platform-plan-number">
                          {
                            plan.value
                          }
                        </strong>
                      </div>

                      <div className="platform-plan-progress">
                        <div
                          className="platform-plan-progress-value"
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                }
              )
            }
          </div>
        </article>

        <article className="platform-panel">
          <div className="platform-panel-header">
            <div>
              <span className="platform-panel-label">
                STATUS
              </span>

              <h3>
                Resumo da plataforma
              </h3>

              <p>
                Situação geral das
                empresas e assinaturas.
              </p>
            </div>

            <ShieldIcon />
          </div>

          <div className="platform-summary-list">
            <SummaryRow
              label="Empresas ativas"
              value={
                dashboard
                  ?.activeOrganizations ??
                0
              }
            />

            <SummaryRow
              label="Empresas suspensas"
              value={
                dashboard
                  ?.inactiveOrganizations ??
                0
              }
            />

            <SummaryRow
              label="Taxa de empresas ativas"
              value={
                `${activePercentage}%`
              }
            />

            <SummaryRow
              label="Assinaturas ativas"
              value={
                dashboard
                  ?.activeSubscriptions ??
                0
              }
            />

            <SummaryRow
              label="Receita mensal estimada"
              value={
                formatCurrency(
                  dashboard
                    ?.estimatedMonthlyRevenue
                )
              }
              emphasized
            />
          </div>
        </article>
      </section>

      <section className="platform-panel platform-organizations-panel">
        <div className="platform-organizations-header">
          <div>
            <span className="platform-panel-label">
              EMPRESAS
            </span>

            <h3>
              Empresas cadastradas
            </h3>

            <p>
              Visão rápida das primeiras
              empresas retornadas pela
              plataforma.
            </p>
          </div>

          <button
            type="button"
            className="platform-secondary-action"
            onClick={
              () =>
                navigate(
                  '/platform/organizations'
                )
            }
          >
            Ver todas

            <ArrowRightIcon />
          </button>
        </div>

        {
          recentOrganizations.length ===
          0
            ? (
              <div className="platform-empty-state">
                <div className="platform-empty-icon">
                  <BuildingIcon />
                </div>

                <h4>
                  Nenhuma empresa cadastrada
                </h4>

                <p>
                  Cadastre a primeira
                  empresa cliente para
                  começar a utilizar a
                  plataforma.
                </p>
              </div>
            )
            : (
              <div className="platform-organizations-list">
                {
                  recentOrganizations.map(
                    (
                      organization
                    ) => (
                      <button
                        type="button"
                        className="platform-organization-row"
                        key={
                          organization.id
                        }
                        onClick={
                          () =>
                            navigate(
                              '/platform/organizations'
                            )
                        }
                      >
                        <div className="platform-organization-main">
                          <div className="platform-organization-avatar">
                            {
                              organization
                                .name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                              'E'
                            }
                          </div>

                          <div>
                            <strong>
                              {
                                organization
                                  .name
                              }
                            </strong>

                            <span>
                              {
                                organization
                                  .ownerName ||
                                organization
                                  .email ||
                                'Sem proprietário informado'
                              }
                            </span>
                          </div>
                        </div>

                        <div className="platform-organization-meta">
                          <span className="platform-plan-badge">
                            {
                              formatPlan(
                                organization
                                  .plan
                              )
                            }
                          </span>

                          <span
                            className={
                              organization
                                .active
                                ? 'platform-status-badge active'
                                : 'platform-status-badge inactive'
                            }
                          >
                            {
                              organization
                                .active
                                ? 'Ativa'
                                : 'Suspensa'
                            }
                          </span>

                          <ArrowRightIcon />
                        </div>
                      </button>
                    )
                  )
                }
              </div>
            )
        }
      </section>

      <section className="platform-admin-footer">
        <div className="platform-admin-footer-icon">
          <ShieldIcon />
        </div>

        <div>
          <span>
            Sessão administrativa
          </span>

          <strong>
            {
              user?.name ||
              'Administrador Prestify'
            }
          </strong>

          <p>
            Você está operando como
            Super Administrador da
            plataforma Prestify.
          </p>
        </div>
      </section>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  description,
  highlight = false,
}) {
  return (
    <article
      className={
        highlight
          ? 'platform-kpi-card platform-kpi-card-highlight'
          : 'platform-kpi-card'
      }
    >
      <div className="platform-kpi-top">
        <div className="platform-kpi-icon">
          {icon}
        </div>

        <span className="platform-kpi-label">
          {label}
        </span>
      </div>

      <strong className="platform-kpi-value">
        {value}
      </strong>

      <p>
        {description}
      </p>
    </article>
  )
}

function SummaryRow({
  label,
  value,
  emphasized = false,
}) {
  return (
    <div className="platform-summary-row">
      <span>
        {label}
      </span>

      <strong
        className={
          emphasized
            ? 'platform-summary-emphasized'
            : ''
        }
      >
        {value}
      </strong>
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2 20 5v6c0 5.4-3.3 9.4-8 11-4.7-1.6-8-5.6-8-11V5l8-3Z" />

      <path d="m8.5 12 2.2 2.2 4.8-5" />
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

function SubscriptionIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="M3 9h18M7 15h4" />
    </svg>
  )
}

function PlanIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 19V9M10 19V5M16 19v-7M22 19V8M2 19h22" />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="9"
        cy="8"
        r="4"
      />

      <path d="M2 21c.4-4 2.7-7 7-7 2 0 3.6.6 4.8 1.6" />

      <circle
        cx="18"
        cy="18"
        r="3"
      />

      <path d="M18 13.5V15M18 21v1.5M13.5 18H15M21 18h1.5" />
    </svg>
  )
}

function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M15 8.5c-.8-.7-1.8-1-3-1-1.7 0-3 .8-3 2s1 1.8 3 2.3c2 .5 3 1.1 3 2.4 0 1.2-1.3 2.3-3 2.3-1.2 0-2.4-.4-3.2-1.2M12 6v12" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 2.5 20h19L12 3Z" />

      <path d="M12 9v5M12 17.5v.5" />
    </svg>
  )
}

export default PlatformDashboardPage