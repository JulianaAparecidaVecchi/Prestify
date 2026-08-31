import { useEffect, useState } from 'react'

import platformOrganizationService
  from '../../services/platformOrganizationService'

import './PlatformOrganizationsPage.css'

const initialForm = {
  name: '',
  document: '',
  email: '',
  phone: '',
  address: '',
  plan: 'BASIC',
  billingCycle: 'MONTHLY',
  subscriptionStatus: 'ACTIVE',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
}

const initialFieldErrors = {
  name: '',
  document: '',
  email: '',
  phone: '',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
}

function PlatformOrganizationsPage() {
  const [
    organizations,
    setOrganizations,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    success,
    setSuccess,
  ] = useState('')

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('')

  const [
    page,
    setPage,
  ] = useState(0)

  const [
    totalPages,
    setTotalPages,
  ] = useState(0)

  const [
    totalElements,
    setTotalElements,
  ] = useState(0)

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false)

  const [
    editingOrganization,
    setEditingOrganization,
  ] = useState(null)

  const [
    form,
    setForm,
  ] = useState(initialForm)

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState(initialFieldErrors)

  const loadOrganizations = async (
    requestedPage = page
  ) => {
    try {
      setLoading(true)
      setError('')

      let active = null

      if (
        statusFilter === 'active'
      ) {
        active = true
      }

      if (
        statusFilter === 'inactive'
      ) {
        active = false
      }

      const data =
        await platformOrganizationService.list({
          search,
          active,
          page: requestedPage,
          size: 10,
        })

      setOrganizations(
        data.content || []
      )

      setTotalPages(
        data.totalPages || 0
      )

      setTotalElements(
        data.totalElements || 0
      )

      setPage(
        data.number || 0
      )
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Não foi possível carregar as empresas.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations(0)
  }, [statusFilter])

  const handleSearch = (
    event
  ) => {
    event.preventDefault()

    loadOrganizations(0)
  }

  const openCreateModal = () => {
    setEditingOrganization(null)

    setForm(initialForm)

    setFieldErrors(
      initialFieldErrors
    )

    setError('')
    setSuccess('')

    setModalOpen(true)
  }

  const openEditModal = (
    organization
  ) => {
    setEditingOrganization(
      organization
    )

    setForm({
      name:
        organization.name || '',

      document:
        formatCnpj(
          organization.document || ''
        ),

      email:
        organization.email || '',

      phone:
        formatPhone(
          organization.phone || ''
        ),

      address:
        organization.address || '',

      plan:
        organization.plan ||
        'BASIC',

      billingCycle:
        organization.billingCycle ||
        'MONTHLY',

      subscriptionStatus:
        organization.subscriptionStatus ||
        'ACTIVE',

      ownerName:
        organization.ownerName || '',

      ownerEmail:
        organization.ownerEmail || '',

      ownerPassword: '',
    })

    setFieldErrors(
      initialFieldErrors
    )

    setError('')
    setSuccess('')

    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setModalOpen(false)

    setEditingOrganization(
      null
    )

    setForm(initialForm)

    setFieldErrors(
      initialFieldErrors
    )

    setError('')
  }

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target

    let newValue = value

    if (
      name === 'document'
    ) {
      newValue =
        formatCnpj(value)
    }

    if (
      name === 'phone'
    ) {
      newValue =
        formatPhone(value)
    }

    setForm((current) => ({
      ...current,
      [name]: newValue,
    }))

    setFieldErrors(
      (current) => ({
        ...current,
        [name]: '',
      })
    )
  }

  const validateForm = () => {
    const errors = {
      ...initialFieldErrors,
    }

    const name =
      form.name.trim()

    const document =
      form.document.trim()

    const email =
      form.email.trim()

    const phone =
      form.phone.trim()

    const ownerName =
      form.ownerName.trim()

    const ownerEmail =
      form.ownerEmail.trim()

    if (!name) {
      errors.name =
        'Informe o nome da empresa.'
    } else if (
      name.length > 150
    ) {
      errors.name =
        'O nome deve ter no máximo 150 caracteres.'
    }

    if (document) {
      const digits =
        onlyDigits(document)

      if (
        digits.length !== 14
      ) {
        errors.document =
          'Informe um CNPJ com 14 dígitos.'
      } else if (
        !isValidCnpj(document)
      ) {
        errors.document =
          'Informe um CNPJ válido.'
      }
    }

    if (
      email &&
      !isValidEmail(email)
    ) {
      errors.email =
        'Informe um e-mail válido.'
    }

    if (
      email.length > 150
    ) {
      errors.email =
        'O e-mail deve ter no máximo 150 caracteres.'
    }

    if (phone) {
      const digits =
        onlyDigits(phone)

      if (
        digits.length !== 10 &&
        digits.length !== 11
      ) {
        errors.phone =
          'Informe um telefone válido com DDD.'
      }
    }

    if (
      !editingOrganization
    ) {
      if (!ownerName) {
        errors.ownerName =
          'Informe o nome do proprietário.'
      } else if (
        ownerName.length > 120
      ) {
        errors.ownerName =
          'O nome deve ter no máximo 120 caracteres.'
      }

      if (!ownerEmail) {
        errors.ownerEmail =
          'Informe o e-mail do proprietário.'
      } else if (
        !isValidEmail(
          ownerEmail
        )
      ) {
        errors.ownerEmail =
          'Informe um e-mail válido.'
      } else if (
        ownerEmail.length > 150
      ) {
        errors.ownerEmail =
          'O e-mail deve ter no máximo 150 caracteres.'
      }

      if (
        !form.ownerPassword
      ) {
        errors.ownerPassword =
          'Informe a senha inicial.'
      } else if (
        form.ownerPassword.length < 8
      ) {
        errors.ownerPassword =
          'A senha deve ter pelo menos 8 caracteres.'
      }
    }

    setFieldErrors(errors)

    return !Object.values(
      errors
    ).some(Boolean)
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!validateForm()) {
      setError(
        'Revise os campos destacados antes de continuar.'
      )

      return
    }

    try {
      setSaving(true)

      const normalizedDocument =
        form.document
          ? onlyDigits(
              form.document
            )
          : null

      const normalizedPhone =
        form.phone
          ? onlyDigits(
              form.phone
            )
          : null

      if (
        editingOrganization
      ) {
        await platformOrganizationService.update(
          editingOrganization.id,
          {
            name:
              form.name.trim(),

            document:
              normalizedDocument,

            email:
              form.email.trim() ||
              null,

            phone:
              normalizedPhone,

            address:
              form.address.trim() ||
              null,

            plan:
              form.plan,

            billingCycle:
              form.billingCycle,

            subscriptionStatus:
              form.subscriptionStatus,
          }
        )

        setSuccess(
          'Empresa atualizada com sucesso.'
        )
      } else {
        await platformOrganizationService.create(
          {
            name:
              form.name.trim(),

            document:
              normalizedDocument,

            email:
              form.email.trim() ||
              null,

            phone:
              normalizedPhone,

            address:
              form.address.trim() ||
              null,

            plan:
              form.plan,

            billingCycle:
              form.billingCycle,

            ownerName:
              form.ownerName.trim(),

            ownerEmail:
              form.ownerEmail
                .trim()
                .toLowerCase(),

            ownerPassword:
              form.ownerPassword,
          }
        )

        setSuccess(
          'Empresa cadastrada com sucesso.'
        )
      }

      setModalOpen(false)

      setEditingOrganization(
        null
      )

      setForm(initialForm)

      setFieldErrors(
        initialFieldErrors
      )

      await loadOrganizations(0)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingOrganization
            ? 'Não foi possível atualizar a empresa.'
            : 'Não foi possível cadastrar a empresa.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange =
    async (
      organization
    ) => {
      const newStatus =
        !organization.active

      try {
        setError('')
        setSuccess('')

        await platformOrganizationService.changeStatus(
          organization.id,
          newStatus
        )

        setSuccess(
          newStatus
            ? 'Empresa reativada com sucesso.'
            : 'Empresa desativada com sucesso.'
        )

        await loadOrganizations(
          page
        )
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            'Não foi possível alterar o status da empresa.'
          )
        )
      }
    }

  const handlePreviousPage =
    () => {
      if (page <= 0) {
        return
      }

      loadOrganizations(
        page - 1
      )
    }

  const handleNextPage = () => {
    if (
      page >=
      totalPages - 1
    ) {
      return
    }

    loadOrganizations(
      page + 1
    )
  }

  return (
    <div className="platform-organizations-page">
      <div className="platform-organizations-heading">
        <div>
          <h1>
            Empresas
          </h1>

          <p>
            Gerencie as empresas
            cadastradas na plataforma
            Prestify.
          </p>
        </div>

        <button
          type="button"
          className="platform-primary-button"
          onClick={
            openCreateModal
          }
        >
          <span>+</span>

          Nova empresa
        </button>
      </div>

      {success && (
        <div className="platform-alert platform-alert-success">
          {success}
        </div>
      )}

      {error &&
        !modalOpen && (
          <div className="platform-alert platform-alert-error">
            {error}
          </div>
        )}

      <div className="platform-organizations-summary">
        <div className="platform-summary-card">
          <span className="platform-summary-label">
            Empresas cadastradas
          </span>

          <strong>
            {totalElements}
          </strong>

          <span className="platform-summary-description">
            Total encontrado com
            os filtros atuais
          </span>
        </div>
      </div>

      <div className="platform-organizations-card">
        <div className="platform-organizations-filters">
          <form
            className="platform-search-form"
            onSubmit={
              handleSearch
            }
          >
            <input
              type="text"
              placeholder="Buscar por nome, documento ou e-mail..."
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />

            <button
              type="submit"
            >
              Buscar
            </button>
          </form>

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) => {
              setStatusFilter(
                event.target
                  .value
              )
            }}
          >
            <option value="">
              Todos os status
            </option>

            <option value="active">
              Ativas
            </option>

            <option value="inactive">
              Inativas
            </option>
          </select>
        </div>

        {loading ? (
          <div className="platform-empty-state">
            Carregando empresas...
          </div>
        ) : organizations.length ===
          0 ? (
          <div className="platform-empty-state">
            <strong>
              Nenhuma empresa
              encontrada
            </strong>

            <span>
              Cadastre uma empresa
              ou altere os filtros
              da pesquisa.
            </span>
          </div>
        ) : (
          <>
            <div className="platform-table-wrapper">
              <table className="platform-organizations-table">
                <thead>
                  <tr>
                    <th>
                      Empresa
                    </th>

                    <th>
                      Proprietário
                    </th>

                    <th>
                      Plano
                    </th>

                    <th>
                      Usuários
                    </th>

                    <th>
                      Assinatura
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {organizations.map(
                    (
                      organization
                    ) => (
                      <tr
                        key={
                          organization.id
                        }
                      >
                        <td>
                          <div className="platform-company-cell">
                            <div className="platform-company-avatar">
                              {getInitials(
                                organization.name
                              )}
                            </div>

                            <div>
                              <strong>
                                {
                                  organization.name
                                }
                              </strong>

                              <span>
                                {organization.document
                                  ? formatCnpj(
                                      organization.document
                                    )
                                  : organization.email ||
                                    'Sem documento informado'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="platform-owner-cell">
                            <strong>
                              {organization.ownerName ||
                                'Sem proprietário'}
                            </strong>

                            <span>
                              {organization.ownerEmail ||
                                ''}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="platform-plan-badge">
                            {formatPlan(
                              organization.plan
                            )}
                          </span>
                        </td>

                        <td>
                          {
                            organization.activeUsers
                          }
                        </td>

                        <td>
                          <div className="platform-subscription-cell">
                            <strong>
                              {formatSubscriptionStatus(
                                organization.subscriptionStatus
                              )}
                            </strong>

                            <span>
                              {formatBillingCycle(
                                organization.billingCycle
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              organization.active
                                ? 'platform-status-badge platform-status-active'
                                : 'platform-status-badge platform-status-inactive'
                            }
                          >
                            {organization.active
                              ? 'Ativa'
                              : 'Inativa'}
                          </span>
                        </td>

                        <td>
                          <div className="platform-table-actions">
                            <button
                              type="button"
                              className="platform-action-button"
                              onClick={() =>
                                openEditModal(
                                  organization
                                )
                              }
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className={
                                organization.active
                                  ? 'platform-action-button platform-action-danger'
                                  : 'platform-action-button platform-action-success'
                              }
                              onClick={() =>
                                handleStatusChange(
                                  organization
                                )
                              }
                            >
                              {organization.active
                                ? 'Desativar'
                                : 'Reativar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="platform-pagination">
              <span>
                Página {page + 1}{' '}
                de{' '}
                {Math.max(
                  totalPages,
                  1
                )}
              </span>

              <div>
                <button
                  type="button"
                  disabled={
                    page <= 0
                  }
                  onClick={
                    handlePreviousPage
                  }
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={
                    page >=
                    totalPages -
                      1
                  }
                  onClick={
                    handleNextPage
                  }
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div
          className="platform-modal-backdrop"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal()
            }
          }}
        >
          <div className="platform-modal">
            <div className="platform-modal-header">
              <div>
                <h2>
                  {editingOrganization
                    ? 'Editar empresa'
                    : 'Nova empresa'}
                </h2>

                <p>
                  {editingOrganization
                    ? 'Atualize os dados da empresa e da assinatura.'
                    : 'Cadastre a empresa e seu primeiro proprietário.'}
                </p>
              </div>

              <button
                type="button"
                className="platform-modal-close"
                onClick={
                  closeModal
                }
              >
                ×
              </button>
            </div>

            <form
              className="platform-organization-form"
              onSubmit={
                handleSubmit
              }
              noValidate
            >
              {error && (
                <div className="platform-alert platform-alert-error">
                  {error}
                </div>
              )}

              <div className="platform-form-section">
                <h3>
                  Dados da empresa
                </h3>

                <div className="platform-form-grid">
                  <div className="platform-form-field platform-form-field-full">
                    <label
                      htmlFor="name"
                    >
                      Nome da empresa *
                    </label>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      maxLength={
                        150
                      }
                    />

                    {fieldErrors.name && (
                      <small
                        style={{
                          color:
                            '#a53434',
                        }}
                      >
                        {
                          fieldErrors.name
                        }
                      </small>
                    )}
                  </div>

                  <div className="platform-form-field">
                    <label
                      htmlFor="document"
                    >
                      CNPJ
                    </label>

                    <input
                      id="document"
                      type="text"
                      name="document"
                      placeholder="00.000.000/0000-00"
                      value={
                        form.document
                      }
                      onChange={
                        handleChange
                      }
                      inputMode="numeric"
                      maxLength={
                        18
                      }
                    />

                    {fieldErrors.document ? (
                      <small
                        style={{
                          color:
                            '#a53434',
                        }}
                      >
                        {
                          fieldErrors.document
                        }
                      </small>
                    ) : (
                      <small>
                        Informe um CNPJ
                        válido.
                      </small>
                    )}
                  </div>

                  <div className="platform-form-field">
                    <label
                      htmlFor="email"
                    >
                      E-mail
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      maxLength={
                        150
                      }
                    />

                    {fieldErrors.email && (
                      <small
                        style={{
                          color:
                            '#a53434',
                        }}
                      >
                        {
                          fieldErrors.email
                        }
                      </small>
                    )}
                  </div>

                  <div className="platform-form-field">
                    <label
                      htmlFor="phone"
                    >
                      Telefone
                    </label>

                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      placeholder="(00) 00000-0000"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                      inputMode="numeric"
                      maxLength={
                        15
                      }
                    />

                    {fieldErrors.phone && (
                      <small
                        style={{
                          color:
                            '#a53434',
                        }}
                      >
                        {
                          fieldErrors.phone
                        }
                      </small>
                    )}
                  </div>

                  <div className="platform-form-field platform-form-field-full">
                    <label
                      htmlFor="address"
                    >
                      Endereço
                    </label>

                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={
                        form.address
                      }
                      onChange={
                        handleChange
                      }
                      maxLength={
                        250
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="platform-form-section">
                <h3>
                  Assinatura
                </h3>

                <div className="platform-form-grid">
                  <div className="platform-form-field">
                    <label
                      htmlFor="plan"
                    >
                      Plano *
                    </label>

                    <select
                      id="plan"
                      name="plan"
                      value={
                        form.plan
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option value="BASIC">
                        Basic
                      </option>

                      <option value="PRO">
                        Pro
                      </option>

                      <option value="PREMIUM">
                        Premium
                      </option>
                    </select>
                  </div>

                  <div className="platform-form-field">
                    <label
                      htmlFor="billingCycle"
                    >
                      Ciclo de cobrança *
                    </label>

                    <select
                      id="billingCycle"
                      name="billingCycle"
                      value={
                        form.billingCycle
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option value="MONTHLY">
                        Mensal
                      </option>

                      <option value="YEARLY">
                        Anual
                      </option>
                    </select>
                  </div>

                  {editingOrganization && (
                    <div className="platform-form-field">
                      <label
                        htmlFor="subscriptionStatus"
                      >
                        Status da assinatura *
                      </label>

                      <select
                        id="subscriptionStatus"
                        name="subscriptionStatus"
                        value={
                          form.subscriptionStatus
                        }
                        onChange={
                          handleChange
                        }
                      >
                        <option value="ACTIVE">
                          Ativa
                        </option>

                        <option value="TRIAL">
                          Período de teste
                        </option>

                        <option value="PAST_DUE">
                          Pagamento pendente
                        </option>

                        <option value="CANCELLED">
                          Cancelada
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {!editingOrganization && (
                <div className="platform-form-section">
                  <h3>
                    Proprietário
                  </h3>

                  <p className="platform-form-section-description">
                    Este usuário será
                    criado automaticamente
                    com o perfil OWNER.
                  </p>

                  <div className="platform-form-grid">
                    <div className="platform-form-field">
                      <label
                        htmlFor="ownerName"
                      >
                        Nome *
                      </label>

                      <input
                        id="ownerName"
                        type="text"
                        name="ownerName"
                        value={
                          form.ownerName
                        }
                        onChange={
                          handleChange
                        }
                        maxLength={
                          120
                        }
                      />

                      {fieldErrors.ownerName && (
                        <small
                          style={{
                            color:
                              '#a53434',
                          }}
                        >
                          {
                            fieldErrors.ownerName
                          }
                        </small>
                      )}
                    </div>

                    <div className="platform-form-field">
                      <label
                        htmlFor="ownerEmail"
                      >
                        E-mail *
                      </label>

                      <input
                        id="ownerEmail"
                        type="email"
                        name="ownerEmail"
                        value={
                          form.ownerEmail
                        }
                        onChange={
                          handleChange
                        }
                        maxLength={
                          150
                        }
                      />

                      {fieldErrors.ownerEmail && (
                        <small
                          style={{
                            color:
                              '#a53434',
                          }}
                        >
                          {
                            fieldErrors.ownerEmail
                          }
                        </small>
                      )}
                    </div>

                    <div className="platform-form-field platform-form-field-full">
                      <label
                        htmlFor="ownerPassword"
                      >
                        Senha inicial *
                      </label>

                      <input
                        id="ownerPassword"
                        type="password"
                        name="ownerPassword"
                        value={
                          form.ownerPassword
                        }
                        onChange={
                          handleChange
                        }
                      />

                      {fieldErrors.ownerPassword ? (
                        <small
                          style={{
                            color:
                              '#a53434',
                          }}
                        >
                          {
                            fieldErrors.ownerPassword
                          }
                        </small>
                      ) : (
                        <small>
                          Mínimo de 8
                          caracteres.
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="platform-modal-actions">
                <button
                  type="button"
                  className="platform-secondary-button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="platform-primary-button"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? 'Salvando...'
                    : editingOrganization
                      ? 'Salvar alterações'
                      : 'Cadastrar empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function onlyDigits(value) {
  return String(
    value || ''
  ).replace(/\D/g, '')
}

function formatCnpj(value) {
  const digits =
    onlyDigits(value)
      .slice(0, 14)

  if (!digits) {
    return ''
  }

  return digits
    .replace(
      /^(\d{2})(\d)/,
      '$1.$2'
    )
    .replace(
      /^(\d{2})\.(\d{3})(\d)/,
      '$1.$2.$3'
    )
    .replace(
      /\.(\d{3})(\d)/,
      '.$1/$2'
    )
    .replace(
      /(\d{4})(\d)/,
      '$1-$2'
    )
}

function formatPhone(value) {
  const digits =
    onlyDigits(value)
      .slice(0, 11)

  if (!digits) {
    return ''
  }

  if (
    digits.length <= 2
  ) {
    return `(${digits}`
  }

  if (
    digits.length <= 6
  ) {
    return digits.replace(
      /^(\d{2})(\d+)/,
      '($1) $2'
    )
  }

  if (
    digits.length <= 10
  ) {
    return digits.replace(
      /^(\d{2})(\d{4})(\d+)/,
      '($1) $2-$3'
    )
  }

  return digits.replace(
    /^(\d{2})(\d{5})(\d{4})$/,
    '($1) $2-$3'
  )
}

function isValidCnpj(value) {
  const cnpj =
    onlyDigits(value)

  if (
    cnpj.length !== 14
  ) {
    return false
  }

  if (
    /^(\d)\1{13}$/.test(
      cnpj
    )
  ) {
    return false
  }

  const calculateDigit = (
    base,
    weights
  ) => {
    const sum =
      base
        .split('')
        .reduce(
          (
            total,
            digit,
            index
          ) =>
            total +
            Number(digit) *
              weights[index],
          0
        )

    const remainder =
      sum % 11

    return remainder < 2
      ? 0
      : 11 - remainder
  }

  const firstDigit =
    calculateDigit(
      cnpj.slice(0, 12),
      [
        5,
        4,
        3,
        2,
        9,
        8,
        7,
        6,
        5,
        4,
        3,
        2,
      ]
    )

  if (
    firstDigit !==
    Number(cnpj[12])
  ) {
    return false
  }

  const secondDigit =
    calculateDigit(
      cnpj.slice(0, 13),
      [
        6,
        5,
        4,
        3,
        2,
        9,
        8,
        7,
        6,
        5,
        4,
        3,
        2,
      ]
    )

  return (
    secondDigit ===
    Number(cnpj[13])
  )
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  )
}

function getInitials(name) {
  if (!name) {
    return 'EM'
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase()
}

function formatPlan(plan) {
  const labels = {
    BASIC: 'Basic',
    PRO: 'Pro',
    PREMIUM: 'Premium',
  }

  return (
    labels[plan] ||
    plan
  )
}

function formatBillingCycle(
  cycle
) {
  const labels = {
    MONTHLY: 'Mensal',
    YEARLY: 'Anual',
  }

  return (
    labels[cycle] ||
    cycle
  )
}

function formatSubscriptionStatus(
  status
) {
  const labels = {
    ACTIVE: 'Ativa',
    TRIAL: 'Teste',
    CANCELLED:
      'Cancelada',
    PAST_DUE:
      'Pendente',
  }

  return (
    labels[status] ||
    status
  )
}

function getErrorMessage(
  error,
  fallback
) {
  const data =
    error?.response?.data

  if (!data) {
    return fallback
  }

  if (
    typeof data.message ===
      'string' &&
    data.message.trim()
  ) {
    return data.message
  }

  if (
    typeof data.error ===
      'string' &&
    data.error.trim()
  ) {
    return data.error
  }

  if (
    data.errors &&
    typeof data.errors ===
      'object'
  ) {
    const firstMessage =
      Object.values(
        data.errors
      )[0]

    if (
      firstMessage
    ) {
      return firstMessage
    }
  }

  return fallback
}

export default PlatformOrganizationsPage