import { useState } from 'react'

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import authService from '../services/authService'

import BrandLogo from '../components/BrandLogo'

import './AppLayout.css'

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
  },
  {
    path: '/agenda',
    label: 'Agenda',
    icon: CalendarIcon,
  },
  {
    path: '/clientes',
    label: 'Clientes',
    icon: UsersIcon,
  },
  {
    path: '/servicos',
    label: 'Serviços',
    icon: ServicesIcon,
  },
  {
    path: '/produtos',
    label: 'Produtos',
    icon: BoxIcon,
  },
  {
    path: '/estoque',
    label: 'Estoque',
    icon: StockIcon,
  },
  {
    path: '/fornecedores',
    label: 'Fornecedores',
    icon: TruckIcon,
  },
  {
    path: '/financeiro',
    label: 'Financeiro',
    icon: WalletIcon,
  },
  {
    path: '/relatorios',
    label: 'Relatórios',
    icon: ChartIcon,
  },
  {
    path: '/usuarios',
    label: 'Usuários',
    icon: UserSettingsIcon,
  },
]

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/agenda': 'Agenda',
  '/clientes': 'Clientes',
  '/servicos': 'Serviços',
  '/produtos': 'Produtos',
  '/estoque': 'Estoque',
  '/fornecedores': 'Fornecedores',
  '/financeiro': 'Financeiro',
  '/relatorios': 'Relatórios',
  '/usuarios': 'Usuários',
  '/configuracoes': 'Configurações',
}

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const user = authService.getUser()

  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] = useState(false)

  const [
    notificationMenuOpen,
    setNotificationMenuOpen,
  ] = useState(false)

  /*
   * Por enquanto não vamos inventar
   * notificações.
   *
   * Quando o backend possuir um endpoint
   * de notificações, esta lista será
   * preenchida pela API.
   */
  const [notifications] = useState([])

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length

  const pageTitle =
    routeTitles[location.pathname] ||
    'Prestify'

  const handleLogout = () => {
    authService.logout()

    navigate('/login', {
      replace: true,
    })
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleNotificationClick = () => {
    setNotificationMenuOpen(
      (current) => !current
    )

    setUserMenuOpen(false)
  }

  const handleUserMenuClick = () => {
    setUserMenuOpen(
      (current) => !current
    )

    setNotificationMenuOpen(false)
  }

  const getInitials = () => {
    if (!user?.name) {
      return 'US'
    }

    const names = user.name
      .trim()
      .split(' ')
      .filter(Boolean)

    if (names.length === 1) {
      return names[0]
        .substring(0, 2)
        .toUpperCase()
    }

    return (
      names[0][0] +
      names[names.length - 1][0]
    ).toUpperCase()
  }

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`app-sidebar ${
          sidebarOpen
            ? 'app-sidebar-open'
            : ''
        }`}
      >
        <div className="sidebar-header">
          <button
            type="button"
            className="sidebar-brand"
            onClick={() => {
              navigate('/dashboard')
              closeSidebar()
            }}
            aria-label="Ir para o Dashboard"
          >
            <BrandLogo variant="sidebar" />
          </button>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={closeSidebar}
            aria-label="Fechar menu"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="sidebar-organization">
          <div className="sidebar-organization-icon">
            <BuildingIcon />
          </div>

          <div>
            <span>
              Organização
            </span>

            <strong>
              {user?.organizationName ||
                'Prestify'}
            </strong>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <span className="sidebar-section-title">
            MENU PRINCIPAL
          </span>

          <div className="sidebar-menu">
            {menuItems.map(
              (item) => {
                const Icon =
                  item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={
                      closeSidebar
                    }
                    className={({
                      isActive,
                    }) =>
                      `sidebar-menu-item ${
                        isActive
                          ? 'sidebar-menu-item-active'
                          : ''
                      }`
                    }
                  >
                    <Icon />

                    <span>
                      {item.label}
                    </span>
                  </NavLink>
                )
              }
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/configuracoes"
            onClick={closeSidebar}
            className={({
              isActive,
            }) =>
              `sidebar-menu-item ${
                isActive
                  ? 'sidebar-menu-item-active'
                  : ''
              }`
            }
          >
            <SettingsIcon />

            <span>
              Configurações
            </span>
          </NavLink>

          <div className="sidebar-version">
            Prestify
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>

      <div className="app-content-area">
        <header className="app-header">
          <div className="app-header-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </button>

            <div>
              <h1>
                {pageTitle}
              </h1>

              <p>
                {getPageSubtitle(
                  location.pathname
                )}
              </p>
            </div>
          </div>

          <div className="app-header-actions">
            <div className="header-notification-wrapper">
              <button
                type="button"
                className={`header-notification-button ${
                  notificationMenuOpen
                    ? 'header-notification-button-active'
                    : ''
                }`}
                aria-label="Notificações"
                title="Notificações"
                onClick={
                  handleNotificationClick
                }
              >
                <BellIcon />

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 9
                      ? '9+'
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationMenuOpen && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <div>
                      <strong>
                        Notificações
                      </strong>

                      <span>
                        Acompanhe as
                        atualizações do
                        seu negócio
                      </span>
                    </div>
                  </div>

                  {notifications.length >
                  0 ? (
                    <div className="notification-list">
                      {notifications.map(
                        (
                          notification
                        ) => (
                          <div
                            key={
                              notification.id
                            }
                            className={`notification-item ${
                              !notification.read
                                ? 'notification-item-unread'
                                : ''
                            }`}
                          >
                            <div className="notification-item-icon">
                              <BellIcon />
                            </div>

                            <div className="notification-item-content">
                              <strong>
                                {
                                  notification.title
                                }
                              </strong>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                              <span>
                                {
                                  notification.time
                                }
                              </span>
                            </div>

                            {!notification.read && (
                              <span className="notification-unread-dot" />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="notification-empty">
                      <div className="notification-empty-icon">
                        <BellIcon />
                      </div>

                      <strong>
                        Nenhuma
                        notificação por
                        enquanto
                      </strong>

                      <p>
                        Novos
                        agendamentos,
                        movimentações e
                        alertas poderão
                        aparecer aqui.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="header-user-wrapper">
              <button
                type="button"
                className="header-user-button"
                onClick={
                  handleUserMenuClick
                }
              >
                <div className="header-user-avatar">
                  {getInitials()}
                </div>

                <div className="header-user-info">
                  <strong>
                    {user?.name ||
                      'Usuário'}
                  </strong>

                  <span>
                    {formatRole(
                      user?.role
                    )}
                  </span>
                </div>

                <ChevronDownIcon />
              </button>

              {userMenuOpen && (
                <div className="header-user-menu">
                  <div className="header-user-menu-info">
                    <strong>
                      {user?.name ||
                        'Usuário'}
                    </strong>

                    <span>
                      {user?.email}
                    </span>
                  </div>

                  <div className="header-user-menu-divider" />

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(
                        false
                      )

                      navigate(
                        '/configuracoes'
                      )
                    }}
                  >
                    <SettingsIcon />

                    Configurações
                  </button>

                  <button
                    type="button"
                    className="header-logout-button"
                    onClick={
                      handleLogout
                    }
                  >
                    <LogoutIcon />

                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function getPageSubtitle(path) {
  const subtitles = {
    '/dashboard':
      'Visão geral do seu negócio',

    '/agenda':
      'Organize seus agendamentos e atendimentos',

    '/clientes':
      'Gerencie os clientes da sua organização',

    '/servicos':
      'Cadastre e gerencie seus serviços',

    '/produtos':
      'Gerencie os produtos do seu negócio',

    '/estoque':
      'Acompanhe entradas, saídas e níveis de estoque',

    '/fornecedores':
      'Gerencie seus fornecedores',

    '/financeiro':
      'Acompanhe receitas, despesas e resultados',

    '/relatorios':
      'Analise indicadores e informações do negócio',

    '/usuarios':
      'Gerencie acessos e usuários do sistema',

    '/configuracoes':
      'Personalize sua organização e seus módulos',
  }

  return (
    subtitles[path] ||
    'Gestão simplificada para seu negócio'
  )
}

function formatRole(role) {
  const roles = {
    OWNER: 'Proprietário',
    ADMIN: 'Administrador',
    MANAGER: 'Gerente',
    EMPLOYEE: 'Funcionário',
  }

  return (
    roles[role] ||
    role ||
    'Usuário'
  )
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M7 2v3M17 2v3M3 9h18" />
      <rect x="3" y="4" width="18" height="17" rx="2" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c.4-4.5 2.8-7 7-7s6.6 2.5 7 7M16 5a4 4 0 0 1 0 7M17 14c3 .5 4.7 2.8 5 6" />
    </svg>
  )
}

function ServicesIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 13.5v-3l-2-.7a7 7 0 0 0-.8-1.8l.9-1.9-2.2-2.2-1.9.9a7 7 0 0 0-1.8-.8L10.5 2h-3l-.7 2a7 7 0 0 0-1.8.8l-1.9-.9L.9 6.1 1.8 8a7 7 0 0 0-.8 1.8l-2 .7v3l2 .7a7 7 0 0 0 .8 1.8l-.9 1.9 2.2 2.2 1.9-.9a7 7 0 0 0 1.8.8l.7 2h3l.7-2a7 7 0 0 0 1.8-.8l1.9.9 2.2-2.2-.9-1.9a7 7 0 0 0 .8-1.8Z" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m4 7 8-4 8 4-8 4-8-4Z" />
      <path d="M4 7v10l8 4 8-4V7M12 11v10" />
    </svg>
  )
}

function StockIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 5h16v5H4zM5 10v10h14V10M9 14h6" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 6h11v11H3zM14 10h4l3 4v3h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
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

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20V7M2 20h22" />
    </svg>
  )
}

function UserSettingsIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="4" />

      <path d="M2 21c.4-4 2.7-7 7-7 2 0 3.6.6 4.8 1.6" />

      <circle cx="18" cy="18" r="3" />

      <path d="M18 13.5V15M18 21v1.5M13.5 18H15M21 18h1.5" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />

      <path d="M19 13.5v-3l-2-.7a7 7 0 0 0-.8-1.8l.9-1.9-2.2-2.2-1.9.9a7 7 0 0 0-1.8-.8L10.5 2h-3l-.7 2a7 7 0 0 0-1.8.8l-1.9-.9L.9 6.1 1.8 8a7 7 0 0 0-.8 1.8l-2 .7v3l2 .7a7 7 0 0 0 .8 1.8l-.9 1.9 2.2 2.2 1.9-.9a7 7 0 0 0 1.8.8l.7 2h3l.7-2a7 7 0 0 0 1.8-.8l1.9.9 2.2-2.2-.9-1.9a7 7 0 0 0 .8-1.8Z" />
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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M10 4H4v16h6M14 8l4 4-4 4M18 12H8" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export default AppLayout