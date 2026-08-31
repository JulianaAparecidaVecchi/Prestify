import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import authService
  from '../../services/authService'

import settingsService
  from '../../services/settingsService'

import './SettingsPage.css'

const MODULES = [
  {
    id: 'AGENDA',
    name: 'Agenda',
    description:
      'Organize horários, profissionais e agendamentos.',
    icon: 'A',
  },
  {
    id: 'CLIENTS',
    name: 'Clientes',
    description:
      'Gerencie os dados e o histórico dos seus clientes.',
    icon: 'C',
  },
  {
    id: 'SERVICES',
    name: 'Serviços',
    description:
      'Cadastre e organize os serviços oferecidos.',
    icon: 'S',
    required: true,
  },
  {
    id: 'PRODUCTS',
    name: 'Produtos',
    description:
      'Gerencie produtos utilizados ou vendidos.',
    icon: 'P',
  },
  {
    id: 'STOCK',
    name: 'Estoque',
    description:
      'Controle quantidades, entradas, saídas e níveis mínimos.',
    icon: 'E',
  },
  {
    id: 'SUPPLIERS',
    name: 'Fornecedores',
    description:
      'Mantenha os fornecedores da empresa organizados.',
    icon: 'F',
  },
  {
    id: 'FINANCIAL',
    name: 'Financeiro',
    description:
      'Controle receitas, despesas e resultados financeiros.',
    icon: '$',
  },
  {
    id: 'REPORTS',
    name: 'Relatórios',
    description:
      'Acompanhe indicadores e resultados do negócio.',
    icon: 'R',
  },
  {
    id: 'USERS',
    name: 'Usuários',
    description:
      'Gerencie os acessos e perfis da equipe.',
    icon: 'U',
  },
]

const PLANS = [
  {
    id: 'BASIC',
    name: 'Básico',
    description:
      'Para operações menores que precisam centralizar a gestão.',
    monthly: 49.9,
  },
  {
    id: 'PRO',
    name: 'Pro',
    description:
      'Para negócios que precisam de uma gestão mais completa.',
    monthly: 99.9,
    featured: true,
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    description:
      'Para operações que precisam de todos os recursos do Prestify.',
    monthly: 159.9,
  },
]

const STATUS_LABELS = {
  ACTIVE: 'Ativa',
  TRIAL: 'Período de teste',
  CANCELLED: 'Cancelada',
  PAST_DUE: 'Pagamento pendente',
}

const PLAN_LABELS = {
  BASIC: 'Básico',
  PRO: 'Pro',
  PREMIUM: 'Premium',
}

const CYCLE_LABELS = {
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
}

const EMPTY_ORGANIZATION = {
  name: '',
  document: '',
  email: '',
  phone: '',
  address: '',
}

const DEFAULT_SYSTEM = {
  timezone: 'America/Sao_Paulo',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  weekStartsOn: 'MONDAY',
  currency: 'BRL',
}

const formatCurrency = (value) => {
  const number = Number(value || 0)

  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  ).format(number)
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  const parts = String(value)
    .split('-')

  if (parts.length !== 3) {
    return value
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

const getErrorMessage = (
  error,
  fallback =
    'Não foi possível concluir a operação.'
) => {
  const data =
    error?.response?.data

  if (
    typeof data?.message === 'string'
  ) {
    return data.message
  }

  if (
    typeof data?.error === 'string'
  ) {
    return data.error
  }

  if (
    data?.errors &&
    typeof data.errors === 'object'
  ) {
    const first =
      Object.values(
        data.errors
      )[0]

    if (
      typeof first === 'string'
    ) {
      return first
    }
  }

  return fallback
}

function Toast({
  toast,
  onClose,
}) {
  if (!toast) {
    return null
  }

  return (
    <div
      className={`settings-toast ${toast.type}`}
    >
      <div>
        <strong>
          {toast.type === 'success'
            ? 'Tudo certo'
            : 'Ocorreu um problema'}
        </strong>

        <span>
          {toast.message}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  )
}

function SettingsPage() {
  const currentUser =
    authService.getUser()

  const role =
    currentUser?.role

  const canAccess =
    role === 'OWNER' ||
    role === 'ADMIN'

  const isOwner =
    role === 'OWNER'

  const [activeTab, setActiveTab] =
    useState('organization')

  const [
    organization,
    setOrganization,
  ] = useState(
    EMPTY_ORGANIZATION
  )

  const [
    enabledModules,
    setEnabledModules,
  ] = useState([
    'SERVICES',
  ])

  const [
    savedModules,
    setSavedModules,
  ] = useState([
    'SERVICES',
  ])

  const [
    systemSettings,
    setSystemSettings,
  ] = useState(
    DEFAULT_SYSTEM
  )

  const [
    billing,
    setBilling,
  ] = useState(null)

  const [
    billingForm,
    setBillingForm,
  ] = useState({
    plan: 'BASIC',
    billingCycle: 'MONTHLY',
  })

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [toast, setToast] =
    useState(null)

  const availableTabs =
    useMemo(() => {
      const tabs = [
        {
          id: 'organization',
          label: 'Empresa',
        },
        {
          id: 'system',
          label: 'Sistema',
        },
      ]

      if (isOwner) {
        tabs.splice(
          1,
          0,
          {
            id: 'modules',
            label: 'Módulos',
          }
        )

        tabs.push({
          id: 'billing',
          label:
            'Plano e faturamento',
        })
      }

      return tabs
    }, [isOwner])

  useEffect(() => {
    if (!canAccess) {
      setLoading(false)
      return
    }

    loadSettings()
  }, [canAccess])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeout =
      window.setTimeout(
        () => {
          setToast(null)
        },
        4000
      )

    return () =>
      window.clearTimeout(
        timeout
      )
  }, [toast])

  const showToast = (
    type,
    message
  ) => {
    setToast({
      type,
      message,
    })
  }

  const loadSettings =
    async () => {
      setLoading(true)

      try {
        const requests = [
          settingsService
            .getSettings(),
          settingsService
            .getSystemSettings(),
        ]

        if (isOwner) {
          requests.push(
            settingsService
              .getBilling()
          )
        }

        const results =
          await Promise.all(
            requests
          )

        const settings =
          results[0]

        const system =
          results[1]

        const billingData =
          isOwner
            ? results[2]
            : null

        setOrganization({
          name:
            settings?.name || '',
          document:
            settings?.document || '',
          email:
            settings?.email || '',
          phone:
            settings?.phone || '',
          address:
            settings?.address || '',
        })

        const modules =
          Array.isArray(
            settings?.enabledModules
          )
            ? settings
                .enabledModules
            : [
                'SERVICES',
              ]

        const normalizedModules =
          modules.includes(
            'SERVICES'
          )
            ? modules
            : [
                ...modules,
                'SERVICES',
              ]

        setEnabledModules(
          normalizedModules
        )

        setSavedModules(
          normalizedModules
        )

        setSystemSettings({
          timezone:
            system?.timezone ||
            'America/Sao_Paulo',

          dateFormat:
            system?.dateFormat ||
            'DD/MM/YYYY',

          timeFormat:
            system?.timeFormat ||
            'HH:mm',

          weekStartsOn:
            system
              ?.weekStartsOn ||
            'MONDAY',

          currency:
            system?.currency ||
            'BRL',
        })

        if (billingData) {
          setBilling(
            billingData
          )

          setBillingForm({
            plan:
              billingData.plan ||
              'BASIC',

            billingCycle:
              billingData
                .billingCycle ||
              'MONTHLY',
          })
        }
      } catch (error) {
        showToast(
          'error',
          getErrorMessage(
            error,
            'Não foi possível carregar as configurações.'
          )
        )
      } finally {
        setLoading(false)
      }
    }

  const handleOrganizationChange =
    (event) => {
      const {
        name,
        value,
      } = event.target

      setOrganization(
        (current) => ({
          ...current,
          [name]: value,
        })
      )
    }

  const handleOrganizationSubmit =
    async (event) => {
      event.preventDefault()

      if (
        !organization
          .name
          .trim()
      ) {
        showToast(
          'error',
          'Informe o nome da empresa.'
        )

        return
      }

      setSaving(true)

      try {
        const result =
          await settingsService
            .updateOrganization(
              {
                name:
                  organization
                    .name
                    .trim(),

                document:
                  organization
                    .document
                    .trim() ||
                  null,

                email:
                  organization
                    .email
                    .trim() ||
                  null,

                phone:
                  organization
                    .phone
                    .trim() ||
                  null,

                address:
                  organization
                    .address
                    .trim() ||
                  null,
              }
            )

        setOrganization({
          name:
            result.name || '',
          document:
            result.document ||
            '',
          email:
            result.email || '',
          phone:
            result.phone || '',
          address:
            result.address || '',
        })

        showToast(
          'success',
          'Dados da empresa atualizados com sucesso.'
        )
      } catch (error) {
        showToast(
          'error',
          getErrorMessage(
            error
          )
        )
      } finally {
        setSaving(false)
      }
    }

  const toggleModule = (
    module
  ) => {
    if (
      module.required
    ) {
      return
    }

    setEnabledModules(
      (current) => {
        if (
          current.includes(
            module.id
          )
        ) {
          return current.filter(
            (id) =>
              id !==
              module.id
          )
        }

        return [
          ...current,
          module.id,
        ]
      }
    )
  }

  const saveModules =
    async () => {
      setSaving(true)

      try {
        const modules =
          enabledModules.includes(
            'SERVICES'
          )
            ? enabledModules
            : [
                ...enabledModules,
                'SERVICES',
              ]

        const result =
          await settingsService
            .updateModules(
              modules
            )

        const updated =
          Array.isArray(
            result
              ?.enabledModules
          )
            ? result
                .enabledModules
            : modules

        setEnabledModules(
          updated
        )

        setSavedModules(
          updated
        )

        showToast(
          'success',
          'Módulos atualizados com sucesso.'
        )
      } catch (error) {
        showToast(
          'error',
          getErrorMessage(
            error
          )
        )
      } finally {
        setSaving(false)
      }
    }

  const resetModules = () => {
    setEnabledModules(
      savedModules
    )
  }

  const handleSystemChange =
    (event) => {
      const {
        name,
        value,
      } = event.target

      setSystemSettings(
        (current) => ({
          ...current,
          [name]: value,
        })
      )
    }

  const handleSystemSubmit =
    async (event) => {
      event.preventDefault()

      setSaving(true)

      try {
        const result =
          await settingsService
            .updateSystemSettings(
              {
                timezone:
                  systemSettings
                    .timezone,

                dateFormat:
                  systemSettings
                    .dateFormat,

                timeFormat:
                  systemSettings
                    .timeFormat,

                weekStartsOn:
                  systemSettings
                    .weekStartsOn,

                currency:
                  systemSettings
                    .currency,
              }
            )

        setSystemSettings(
          result
        )

        showToast(
          'success',
          'Configurações do sistema atualizadas.'
        )
      } catch (error) {
        showToast(
          'error',
          getErrorMessage(
            error
          )
        )
      } finally {
        setSaving(false)
      }
    }

  const handleBillingChange =
    (event) => {
      const {
        name,
        value,
      } = event.target

      setBillingForm(
        (current) => ({
          ...current,
          [name]: value,
        })
      )
    }

  const handleBillingSubmit =
    async (event) => {
      event.preventDefault()

      setSaving(true)

      try {
        const result =
          await settingsService
            .updateBilling({
              plan:
                billingForm.plan,

              billingCycle:
                billingForm
                  .billingCycle,
            })

        setBilling(result)

        setBillingForm({
          plan:
            result.plan,

          billingCycle:
            result.billingCycle,
        })

        showToast(
          'success',
          'Plano atualizado com sucesso.'
        )
      } catch (error) {
        showToast(
          'error',
          getErrorMessage(
            error
          )
        )
      } finally {
        setSaving(false)
      }
    }

  const selectedPlan =
    PLANS.find(
      (plan) =>
        plan.id ===
        billingForm.plan
    )

  const previewPrice =
    billingForm
      .billingCycle ===
    'YEARLY'
      ? selectedPlan
          ?.monthly * 10
      : selectedPlan
          ?.monthly

  if (!canAccess) {
    return (
      <div className="settings-page">
        <div className="settings-access-denied">
          <div className="settings-access-icon">
            !
          </div>

          <h2>
            Acesso restrito
          </h2>

          <p>
            Somente Proprietários
            e Administradores podem
            acessar as configurações
            da organização.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="settings-spinner" />

          <span>
            Carregando configurações...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <div>
          <h1>
            Configurações
          </h1>

          <p>
            Gerencie os dados e
            preferências da sua
            organização.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-tabs">
          <div className="settings-tabs-title">
            Configurações
          </div>

          {availableTabs.map(
            (tab) => (
              <button
                key={tab.id}
                type="button"
                className={
                  activeTab ===
                  tab.id
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }
              >
                {tab.label}
              </button>
            )
          )}
        </aside>

        <main className="settings-content">
          {activeTab ===
            'organization' && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div>
                  <h2>
                    Dados da empresa
                  </h2>

                  <p>
                    Informações
                    principais da
                    organização no
                    Prestify.
                  </p>
                </div>
              </div>

              <form
                className="settings-form"
                onSubmit={
                  handleOrganizationSubmit
                }
              >
                <div className="settings-field full">
                  <label>
                    Nome da empresa
                  </label>

                  <input
                    type="text"
                    name="name"
                    maxLength={150}
                    value={
                      organization.name
                    }
                    onChange={
                      handleOrganizationChange
                    }
                    required
                  />
                </div>

                <div className="settings-field">
                  <label>
                    CPF / CNPJ
                  </label>

                  <input
                    type="text"
                    name="document"
                    maxLength={30}
                    value={
                      organization
                        .document
                    }
                    onChange={
                      handleOrganizationChange
                    }
                    placeholder="Documento da empresa"
                  />
                </div>

                <div className="settings-field">
                  <label>
                    E-mail
                  </label>

                  <input
                    type="email"
                    name="email"
                    maxLength={150}
                    value={
                      organization.email
                    }
                    onChange={
                      handleOrganizationChange
                    }
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div className="settings-field">
                  <label>
                    Telefone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    maxLength={30}
                    value={
                      organization.phone
                    }
                    onChange={
                      handleOrganizationChange
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="settings-field">
                  <label>
                    Plano atual
                  </label>

                  <div className="settings-readonly">
                    {PLAN_LABELS[
                      billing?.plan
                    ] ||
                      PLAN_LABELS[
                        billingForm
                          .plan
                      ] ||
                      '-'}
                  </div>
                </div>

                <div className="settings-field full">
                  <label>
                    Endereço
                  </label>

                  <input
                    type="text"
                    name="address"
                    maxLength={250}
                    value={
                      organization.address
                    }
                    onChange={
                      handleOrganizationChange
                    }
                    placeholder="Endereço da empresa"
                  />
                </div>

                <div className="settings-actions">
                  <button
                    type="submit"
                    className="settings-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? 'Salvando...'
                      : 'Salvar alterações'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab ===
            'modules' &&
            isOwner && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div>
                  <h2>
                    Módulos do sistema
                  </h2>

                  <p>
                    Escolha quais
                    recursos estarão
                    disponíveis para
                    sua organização.
                  </p>
                </div>
              </div>

              <div className="settings-module-info">
                O módulo de
                Serviços é obrigatório
                e não pode ser
                desativado.
              </div>

              <div className="settings-modules-grid">
                {MODULES.map(
                  (module) => {
                    const enabled =
                      enabledModules
                        .includes(
                          module.id
                        )

                    return (
                      <button
                        key={
                          module.id
                        }
                        type="button"
                        className={`settings-module-card ${
                          enabled
                            ? 'enabled'
                            : ''
                        } ${
                          module.required
                            ? 'required'
                            : ''
                        }`}
                        onClick={() =>
                          toggleModule(
                            module
                          )
                        }
                      >
                        <div className="settings-module-top">
                          <div className="settings-module-icon">
                            {
                              module.icon
                            }
                          </div>

                          <div
                            className={`settings-switch ${
                              enabled
                                ? 'on'
                                : ''
                            }`}
                          >
                            <span />
                          </div>
                        </div>

                        <strong>
                          {
                            module.name
                          }
                        </strong>

                        <p>
                          {
                            module.description
                          }
                        </p>

                        {module.required && (
                          <small>
                            Obrigatório
                          </small>
                        )}
                      </button>
                    )
                  }
                )}
              </div>

              <div className="settings-actions">
                <button
                  type="button"
                  className="settings-secondary-button"
                  onClick={
                    resetModules
                  }
                  disabled={saving}
                >
                  Descartar
                </button>

                <button
                  type="button"
                  className="settings-primary-button"
                  onClick={
                    saveModules
                  }
                  disabled={saving}
                >
                  {saving
                    ? 'Salvando...'
                    : 'Salvar módulos'}
                </button>
              </div>
            </section>
          )}

          {activeTab ===
            'system' && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div>
                  <h2>
                    Configurações do sistema
                  </h2>

                  <p>
                    Defina padrões
                    regionais e de
                    exibição utilizados
                    pela organização.
                  </p>
                </div>
              </div>

              <form
                className="settings-form"
                onSubmit={
                  handleSystemSubmit
                }
              >
                <div className="settings-field full">
                  <label>
                    Fuso horário
                  </label>

                  <select
                    name="timezone"
                    value={
                      systemSettings
                        .timezone
                    }
                    onChange={
                      handleSystemChange
                    }
                  >
                    <option value="America/Sao_Paulo">
                      Brasília
                      (America/Sao_Paulo)
                    </option>

                    <option value="America/Manaus">
                      Manaus
                      (America/Manaus)
                    </option>

                    <option value="America/Cuiaba">
                      Cuiabá
                      (America/Cuiaba)
                    </option>

                    <option value="America/Rio_Branco">
                      Rio Branco
                      (America/Rio_Branco)
                    </option>

                    <option value="America/Noronha">
                      Fernando de Noronha
                      (America/Noronha)
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label>
                    Formato de data
                  </label>

                  <select
                    name="dateFormat"
                    value={
                      systemSettings
                        .dateFormat
                    }
                    onChange={
                      handleSystemChange
                    }
                  >
                    <option value="DD/MM/YYYY">
                      DD/MM/YYYY
                    </option>

                    <option value="MM/DD/YYYY">
                      MM/DD/YYYY
                    </option>

                    <option value="YYYY-MM-DD">
                      YYYY-MM-DD
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label>
                    Formato de hora
                  </label>

                  <select
                    name="timeFormat"
                    value={
                      systemSettings
                        .timeFormat
                    }
                    onChange={
                      handleSystemChange
                    }
                  >
                    <option value="HH:mm">
                      24 horas
                      (HH:mm)
                    </option>

                    <option value="hh:mm A">
                      12 horas
                      (hh:mm A)
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label>
                    Primeiro dia da semana
                  </label>

                  <select
                    name="weekStartsOn"
                    value={
                      systemSettings
                        .weekStartsOn
                    }
                    onChange={
                      handleSystemChange
                    }
                  >
                    <option value="MONDAY">
                      Segunda-feira
                    </option>

                    <option value="SUNDAY">
                      Domingo
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label>
                    Moeda
                  </label>

                  <select
                    name="currency"
                    value={
                      systemSettings
                        .currency
                    }
                    onChange={
                      handleSystemChange
                    }
                  >
                    <option value="BRL">
                      Real brasileiro
                      (BRL)
                    </option>

                    <option value="USD">
                      Dólar americano
                      (USD)
                    </option>

                    <option value="EUR">
                      Euro (EUR)
                    </option>
                  </select>
                </div>

                <div className="settings-actions">
                  <button
                    type="submit"
                    className="settings-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? 'Salvando...'
                      : 'Salvar configurações'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab ===
            'billing' &&
            isOwner && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div>
                  <h2>
                    Plano e faturamento
                  </h2>

                  <p>
                    Consulte sua
                    assinatura e altere
                    o plano ou ciclo
                    de cobrança.
                  </p>
                </div>
              </div>

              {billing && (
                <div className="settings-billing-summary">
                  <div>
                    <span>
                      Plano atual
                    </span>

                    <strong>
                      {PLAN_LABELS[
                        billing.plan
                      ] ||
                        billing.plan}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong
                      className={`settings-subscription-status ${String(
                        billing
                          .subscriptionStatus
                      ).toLowerCase()}`}
                    >
                      {STATUS_LABELS[
                        billing
                          .subscriptionStatus
                      ] ||
                        billing
                          .subscriptionStatus}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Ciclo
                    </span>

                    <strong>
                      {CYCLE_LABELS[
                        billing
                          .billingCycle
                      ] ||
                        billing
                          .billingCycle}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Valor
                    </span>

                    <strong>
                      {formatCurrency(
                        billing.price
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Início
                    </span>

                    <strong>
                      {formatDate(
                        billing
                          .subscriptionStartDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Próxima cobrança
                    </span>

                    <strong>
                      {formatDate(
                        billing
                          .nextBillingDate
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <form
                onSubmit={
                  handleBillingSubmit
                }
              >
                <div className="settings-billing-cycle">
                  <span>
                    Ciclo de cobrança
                  </span>

                  <div>
                    <label
                      className={
                        billingForm
                          .billingCycle ===
                        'MONTHLY'
                          ? 'selected'
                          : ''
                      }
                    >
                      <input
                        type="radio"
                        name="billingCycle"
                        value="MONTHLY"
                        checked={
                          billingForm
                            .billingCycle ===
                          'MONTHLY'
                        }
                        onChange={
                          handleBillingChange
                        }
                      />

                      Mensal
                    </label>

                    <label
                      className={
                        billingForm
                          .billingCycle ===
                        'YEARLY'
                          ? 'selected'
                          : ''
                      }
                    >
                      <input
                        type="radio"
                        name="billingCycle"
                        value="YEARLY"
                        checked={
                          billingForm
                            .billingCycle ===
                          'YEARLY'
                        }
                        onChange={
                          handleBillingChange
                        }
                      />

                      Anual

                      <small>
                        2 meses grátis
                      </small>
                    </label>
                  </div>
                </div>

                <div className="settings-plans-grid">
                  {PLANS.map(
                    (plan) => {
                      const selected =
                        billingForm
                          .plan ===
                        plan.id

                      const price =
                        billingForm
                          .billingCycle ===
                        'YEARLY'
                          ? plan.monthly *
                            10
                          : plan.monthly

                      return (
                        <label
                          key={
                            plan.id
                          }
                          className={`settings-plan-card ${
                            selected
                              ? 'selected'
                              : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="plan"
                            value={
                              plan.id
                            }
                            checked={
                              selected
                            }
                            onChange={
                              handleBillingChange
                            }
                          />

                          {plan.featured && (
                            <span className="settings-plan-featured">
                              Recomendado
                            </span>
                          )}

                          <h3>
                            {
                              plan.name
                            }
                          </h3>

                          <p>
                            {
                              plan.description
                            }
                          </p>

                          <div className="settings-plan-price">
                            <strong>
                              {formatCurrency(
                                price
                              )}
                            </strong>

                            <span>
                              {billingForm
                                .billingCycle ===
                              'YEARLY'
                                ? '/ano'
                                : '/mês'}
                            </span>
                          </div>
                        </label>
                      )
                    }
                  )}
                </div>

                <div className="settings-billing-preview">
                  <div>
                    <span>
                      Nova configuração
                    </span>

                    <strong>
                      {
                        selectedPlan
                          ?.name
                      }{' '}
                      ·{' '}
                      {CYCLE_LABELS[
                        billingForm
                          .billingCycle
                      ]}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Valor
                    </span>

                    <strong>
                      {formatCurrency(
                        previewPrice
                      )}
                    </strong>
                  </div>
                </div>

                <div className="settings-actions">
                  <button
                    type="submit"
                    className="settings-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? 'Atualizando...'
                      : 'Atualizar plano'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </main>
      </div>

      <Toast
        toast={toast}
        onClose={() =>
          setToast(null)
        }
      />
    </div>
  )
}

export default SettingsPage