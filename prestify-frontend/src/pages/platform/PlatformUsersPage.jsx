import {
  useEffect,
  useState,
} from 'react'

import authService
  from '../../services/authService'

import platformUserService
  from '../../services/platformUserService'

import './PlatformUsersPage.css'

const initialForm = {
  name: '',
  email: '',
  password: '',
}

const initialFieldErrors = {
  name: '',
  email: '',
  password: '',
}

function PlatformUsersPage() {
  const currentUser =
    authService.getUser()

  const [
    users,
    setUsers,
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
    editingUser,
    setEditingUser,
  ] = useState(null)

  const [
    form,
    setForm,
  ] = useState(
    initialForm
  )

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState(
    initialFieldErrors
  )

  const loadUsers = async (
    requestedPage = page
  ) => {
    try {
      setLoading(true)
      setError('')

      let active = null

      if (
        statusFilter ===
        'active'
      ) {
        active = true
      }

      if (
        statusFilter ===
        'inactive'
      ) {
        active = false
      }

      const data =
        await platformUserService.list(
          {
            search,
            active,
            page:
              requestedPage,
            size: 10,
          }
        )

      setUsers(
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
          'Não foi possível carregar os usuários da plataforma.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(0)
  }, [statusFilter])

  const handleSearch = (
    event
  ) => {
    event.preventDefault()

    loadUsers(0)
  }

  const openCreateModal =
    () => {
      setEditingUser(null)

      setForm(
        initialForm
      )

      setFieldErrors(
        initialFieldErrors
      )

      setError('')
      setSuccess('')

      setModalOpen(true)
    }

  const openEditModal = (
    user
  ) => {
    setEditingUser(user)

    setForm({
      name:
        user.name || '',

      email:
        user.email || '',

      password: '',
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

    setEditingUser(null)

    setForm(
      initialForm
    )

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

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    )

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

    const email =
      form.email.trim()

    if (!name) {
      errors.name =
        'Informe o nome do administrador.'
    } else if (
      name.length > 120
    ) {
      errors.name =
        'O nome deve ter no máximo 120 caracteres.'
    }

    if (!email) {
      errors.email =
        'Informe o e-mail do administrador.'
    } else if (
      !isValidEmail(
        email
      )
    ) {
      errors.email =
        'Informe um e-mail válido.'
    } else if (
      email.length > 150
    ) {
      errors.email =
        'O e-mail deve ter no máximo 150 caracteres.'
    }

    if (
      !editingUser
    ) {
      if (!form.password) {
        errors.password =
          'Informe a senha inicial.'
      } else if (
        form.password.length <
        8
      ) {
        errors.password =
          'A senha deve ter pelo menos 8 caracteres.'
      }
    } else if (
      form.password &&
      form.password.length < 8
    ) {
      errors.password =
        'A nova senha deve ter pelo menos 8 caracteres.'
    }

    setFieldErrors(
      errors
    )

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

      const payload = {
        name:
          form.name.trim(),

        email:
          form.email
            .trim()
            .toLowerCase(),
      }

      if (
        form.password
      ) {
        payload.password =
          form.password
      }

      if (editingUser) {
        await platformUserService.update(
          editingUser.id,
          {
            ...payload,
            password:
              form.password ||
              null,
          }
        )

        setSuccess(
          'Usuário da plataforma atualizado com sucesso.'
        )
      } else {
        await platformUserService.create(
          payload
        )

        setSuccess(
          'Administrador da plataforma cadastrado com sucesso.'
        )
      }

      setModalOpen(false)

      setEditingUser(null)

      setForm(
        initialForm
      )

      setFieldErrors(
        initialFieldErrors
      )

      await loadUsers(0)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingUser
            ? 'Não foi possível atualizar o usuário.'
            : 'Não foi possível cadastrar o usuário.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange =
    async (user) => {
      const isCurrentUser =
        String(user.id) ===
        String(
          currentUser?.id ??
          currentUser?.userId
        )

      if (
        isCurrentUser &&
        user.active
      ) {
        setError(
          'Você não pode desativar seu próprio usuário.'
        )

        return
      }

      const newStatus =
        !user.active

      try {
        setError('')
        setSuccess('')

        await platformUserService.changeStatus(
          user.id,
          newStatus
        )

        setSuccess(
          newStatus
            ? 'Usuário reativado com sucesso.'
            : 'Usuário desativado com sucesso.'
        )

        await loadUsers(
          page
        )
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            'Não foi possível alterar o status do usuário.'
          )
        )
      }
    }

  const handlePreviousPage =
    () => {
      if (page <= 0) {
        return
      }

      loadUsers(
        page - 1
      )
    }

  const handleNextPage =
    () => {
      if (
        page >=
        totalPages - 1
      ) {
        return
      }

      loadUsers(
        page + 1
      )
    }

  return (
    <div className="platform-users-page">
      <div className="platform-users-heading">
        <div>
          <h1>
            Usuários da Plataforma
          </h1>

          <p>
            Gerencie os
            administradores internos
            responsáveis pela
            plataforma Prestify.
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

          Novo administrador
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

      <div className="platform-users-summary">
        <div className="platform-summary-card">
          <span className="platform-summary-label">
            Administradores
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

      <div className="platform-users-card">
        <div className="platform-users-filters">
          <form
            className="platform-search-form"
            onSubmit={
              handleSearch
            }
          >
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
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
            ) =>
              setStatusFilter(
                event.target
                  .value
              )
            }
          >
            <option value="">
              Todos os status
            </option>

            <option value="active">
              Ativos
            </option>

            <option value="inactive">
              Inativos
            </option>
          </select>
        </div>

        {loading ? (
          <div className="platform-empty-state">
            Carregando usuários...
          </div>
        ) : users.length ===
          0 ? (
          <div className="platform-empty-state">
            <strong>
              Nenhum administrador
              encontrado
            </strong>

            <span>
              Cadastre um
              administrador ou
              altere os filtros da
              pesquisa.
            </span>
          </div>
        ) : (
          <>
            <div className="platform-table-wrapper">
              <table className="platform-users-table">
                <thead>
                  <tr>
                    <th>
                      Administrador
                    </th>

                    <th>
                      Perfil
                    </th>

                    <th>
                      Cadastro
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
                  {users.map(
                    (user) => {
                      const isCurrentUser =
                        String(
                          user.id
                        ) ===
                        String(
                          currentUser?.id ??
                          currentUser?.userId
                        )

                      return (
                        <tr
                          key={
                            user.id
                          }
                        >
                          <td>
                            <div className="platform-user-cell">
                              <div className="platform-user-avatar">
                                {getInitials(
                                  user.name
                                )}
                              </div>

                              <div>
                                <div className="platform-user-name-row">
                                  <strong>
                                    {
                                      user.name
                                    }
                                  </strong>

                                  {isCurrentUser && (
                                    <span className="platform-current-user-badge">
                                      Você
                                    </span>
                                  )}
                                </div>

                                <span>
                                  {
                                    user.email
                                  }
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="platform-role-badge">
                              Super
                              Administrador
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              user.createdAt
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                user.active
                                  ? 'platform-status-badge platform-status-active'
                                  : 'platform-status-badge platform-status-inactive'
                              }
                            >
                              {user.active
                                ? 'Ativo'
                                : 'Inativo'}
                            </span>
                          </td>

                          <td>
                            <div className="platform-table-actions">
                              <button
                                type="button"
                                className="platform-action-button"
                                onClick={() =>
                                  openEditModal(
                                    user
                                  )
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className={
                                  user.active
                                    ? 'platform-action-button platform-action-danger'
                                    : 'platform-action-button platform-action-success'
                                }
                                disabled={
                                  isCurrentUser &&
                                  user.active
                                }
                                title={
                                  isCurrentUser &&
                                  user.active
                                    ? 'Você não pode desativar seu próprio usuário.'
                                    : ''
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    user
                                  )
                                }
                              >
                                {user.active
                                  ? 'Desativar'
                                  : 'Reativar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    }
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
          <div className="platform-modal platform-user-modal">
            <div className="platform-modal-header">
              <div>
                <h2>
                  {editingUser
                    ? 'Editar administrador'
                    : 'Novo administrador'}
                </h2>

                <p>
                  {editingUser
                    ? 'Atualize os dados de acesso deste administrador.'
                    : 'Crie um novo usuário interno para administrar o Prestify.'}
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
              className="platform-user-form"
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
                  Dados do administrador
                </h3>

                <div className="platform-form-grid">
                  <div className="platform-form-field platform-form-field-full">
                    <label
                      htmlFor="name"
                    >
                      Nome *
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
                        120
                      }
                      autoComplete="name"
                    />

                    {fieldErrors.name && (
                      <small className="platform-field-error">
                        {
                          fieldErrors.name
                        }
                      </small>
                    )}
                  </div>

                  <div className="platform-form-field platform-form-field-full">
                    <label
                      htmlFor="email"
                    >
                      E-mail *
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
                      autoComplete="email"
                    />

                    {fieldErrors.email && (
                      <small className="platform-field-error">
                        {
                          fieldErrors.email
                        }
                      </small>
                    )}
                  </div>

                  <div className="platform-form-field platform-form-field-full">
                    <label
                      htmlFor="password"
                    >
                      {editingUser
                        ? 'Nova senha'
                        : 'Senha inicial *'}
                    </label>

                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={
                        form.password
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="new-password"
                    />

                    {fieldErrors.password ? (
                      <small className="platform-field-error">
                        {
                          fieldErrors.password
                        }
                      </small>
                    ) : (
                      <small>
                        {editingUser
                          ? 'Deixe em branco para manter a senha atual. Mínimo de 8 caracteres para alterar.'
                          : 'Mínimo de 8 caracteres.'}
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <div className="platform-user-security-note">
                <div className="platform-user-security-icon">
                  !
                </div>

                <div>
                  <strong>
                    Acesso administrativo
                  </strong>

                  <p>
                    Este usuário terá
                    acesso à administração
                    global da plataforma e
                    não ficará vinculado a
                    nenhuma empresa.
                  </p>
                </div>
              </div>

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
                    : editingUser
                      ? 'Salvar alterações'
                      : 'Cadastrar administrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function isValidEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  )
}

function getInitials(
  name
) {
  if (!name) {
    return 'AD'
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

function formatDate(
  value
) {
  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  ).format(date)
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

    if (firstMessage) {
      return firstMessage
    }
  }

  return fallback
}

export default PlatformUsersPage