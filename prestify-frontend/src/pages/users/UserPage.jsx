import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import authService from '../../services/authService'
import userService from '../../services/userService'

import './UserPage.css'

const ROLE_LABELS = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  EMPLOYEE: 'Funcionário',
}

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
}

const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    }
  ).format(date)
}

const getInitials = (name) => {
  if (!name) {
    return 'U'
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase()
}

const getErrorMessage = (
  error,
  fallback = 'Não foi possível concluir a operação.'
) => {
  const data = error?.response?.data

  if (typeof data?.message === 'string') {
    return data.message
  }

  if (typeof data?.error === 'string') {
    return data.error
  }

  if (
    data?.errors &&
    typeof data.errors === 'object'
  ) {
    const firstError =
      Object.values(data.errors)[0]

    if (typeof firstError === 'string') {
      return firstError
    }
  }

  return fallback
}

function UserModal({
  open,
  mode,
  form,
  selectedUser,
  currentUser,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!open) {
    return null
  }

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const currentRole =
    currentUser?.role

  const availableRoles =
    currentRole === 'ADMIN'
      ? [
          'ADMIN',
          'MANAGER',
          'EMPLOYEE',
        ]
      : [
          'OWNER',
          'ADMIN',
          'MANAGER',
          'EMPLOYEE',
        ]

  return (
    <div
      className="user-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose()
        }
      }}
    >
      <div className="user-modal">
        <div className="user-modal-header">
          <div>
            <span className="user-modal-eyebrow">
              {isView
                ? 'Detalhes'
                : isEdit
                  ? 'Edição'
                  : 'Cadastro'}
            </span>

            <h2>
              {isView
                ? 'Detalhes do usuário'
                : isEdit
                  ? 'Editar usuário'
                  : 'Novo usuário'}
            </h2>
          </div>

          <button
            type="button"
            className="user-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {isView ? (
          <div className="user-detail-content">
            <div className="user-detail-profile">
              <div className="user-detail-avatar">
                {getInitials(
                  selectedUser?.name
                )}
              </div>

              <div>
                <strong>
                  {selectedUser?.name}
                </strong>

                <span>
                  {selectedUser?.email}
                </span>
              </div>
            </div>

            <div className="user-detail-grid">
              <div className="user-detail-item">
                <span>Perfil</span>

                <strong>
                  {ROLE_LABELS[
                    selectedUser?.role
                  ] || selectedUser?.role}
                </strong>
              </div>

              <div className="user-detail-item">
                <span>Status</span>

                <strong>
                  {selectedUser?.active
                    ? 'Ativo'
                    : 'Inativo'}
                </strong>
              </div>

              <div className="user-detail-item">
                <span>Cadastrado em</span>

                <strong>
                  {formatDateTime(
                    selectedUser
                      ?.createdAt
                  )}
                </strong>
              </div>

              <div className="user-detail-item">
                <span>
                  Última atualização
                </span>

                <strong>
                  {formatDateTime(
                    selectedUser
                      ?.updatedAt
                  )}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <form
            className="user-form"
            onSubmit={onSubmit}
          >
            <div className="user-form-field full">
              <label htmlFor="user-name">
                Nome
              </label>

              <input
                id="user-name"
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                maxLength={120}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="user-form-field full">
              <label htmlFor="user-email">
                E-mail
              </label>

              <input
                id="user-email"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="user-form-field">
              <label htmlFor="user-role">
                Perfil
              </label>

              <select
                id="user-role"
                name="role"
                value={form.role}
                onChange={onChange}
                required
              >
                {availableRoles.map(
                  (role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {ROLE_LABELS[role]}
                    </option>
                  )
                )}
              </select>

              {currentRole === 'ADMIN' && (
                <span className="user-field-help">
                  Administradores não
                  podem atribuir o perfil
                  Proprietário.
                </span>
              )}
            </div>

            <div className="user-form-field">
              <label htmlFor="user-password">
                {isEdit
                  ? 'Nova senha'
                  : 'Senha'}
              </label>

              <input
                id="user-password"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                minLength={8}
                placeholder={
                  isEdit
                    ? 'Deixe em branco para manter'
                    : 'Mínimo de 8 caracteres'
                }
                required={!isEdit}
              />

              {isEdit && (
                <span className="user-field-help">
                  Preencha somente se
                  desejar alterar a senha.
                </span>
              )}
            </div>

            <div className="user-modal-actions">
              <button
                type="button"
                className="user-button-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="user-button-primary"
                disabled={saving}
              >
                {saving
                  ? 'Salvando...'
                  : isEdit
                    ? 'Salvar alterações'
                    : 'Cadastrar usuário'}
              </button>
            </div>
          </form>
        )}

        {isView && (
          <div className="user-modal-actions">
            <button
              type="button"
              className="user-button-primary"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ConfirmationModal({
  open,
  user,
  loading,
  onCancel,
  onConfirm,
}) {
  if (!open || !user) {
    return null
  }

  const activating =
    user.active === false

  return (
    <div className="user-modal-backdrop">
      <div className="user-confirm-modal">
        <div
          className={`user-confirm-icon ${
            activating
              ? 'activate'
              : 'deactivate'
          }`}
        >
          {activating ? '✓' : '!'}
        </div>

        <h2>
          {activating
            ? 'Reativar usuário?'
            : 'Desativar usuário?'}
        </h2>

        <p>
          {activating ? (
            <>
              O usuário{' '}
              <strong>
                {user.name}
              </strong>{' '}
              voltará a ficar ativo no
              sistema.
            </>
          ) : (
            <>
              O usuário{' '}
              <strong>
                {user.name}
              </strong>{' '}
              ficará inativo no sistema.
            </>
          )}
        </p>

        <div className="user-confirm-actions">
          <button
            type="button"
            className="user-button-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="button"
            className={
              activating
                ? 'user-button-primary'
                : 'user-button-danger'
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? 'Processando...'
              : activating
                ? 'Reativar'
                : 'Desativar'}
          </button>
        </div>
      </div>
    </div>
  )
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
      className={`user-toast ${toast.type}`}
    >
      <div>
        <strong>
          {toast.type === 'success'
            ? 'Tudo certo'
            : 'Ocorreu um problema'}
        </strong>

        <span>{toast.message}</span>
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

function UserPage() {
  const currentUser =
    authService.getUser()

  const canView =
    currentUser?.role === 'OWNER' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'MANAGER'

  const canManage =
    currentUser?.role === 'OWNER' ||
    currentUser?.role === 'ADMIN'

  const [users, setUsers] =
    useState([])

  const [search, setSearch] =
    useState('')

  const [appliedSearch, setAppliedSearch] =
    useState('')

  const [page, setPage] =
    useState(0)

  const [pageInfo, setPageInfo] =
    useState({
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
    })

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [modal, setModal] =
    useState({
      open: false,
      mode: 'create',
    })

  const [selectedUser, setSelectedUser] =
    useState(null)

  const [form, setForm] =
    useState(EMPTY_FORM)

  const [confirmUser, setConfirmUser] =
    useState(null)

  const [
    changingStatus,
    setChangingStatus,
  ] = useState(false)

  const [toast, setToast] =
    useState(null)

  const currentUserId =
    Number(currentUser?.userId)

  const loadUsers = useCallback(
    async () => {
      if (!canView) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const data =
          await userService.list({
            search: appliedSearch,
            page,
            size: 10,
          })

        setUsers(
          data?.content || []
        )

        setPageInfo({
          totalElements:
            data?.totalElements || 0,

          totalPages:
            data?.totalPages || 0,

          number:
            data?.number || 0,

          size:
            data?.size || 10,

          first:
            Boolean(data?.first),

          last:
            Boolean(data?.last),
        })
      } catch (error) {
        showToast(
          'error',
          getErrorMessage(
            error,
            'Não foi possível carregar os usuários.'
          )
        )
      } finally {
        setLoading(false)
      }
    },
    [
      appliedSearch,
      page,
      canView,
    ]
  )

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeout =
      window.setTimeout(() => {
        setToast(null)
      }, 4000)

    return () => {
      window.clearTimeout(timeout)
    }
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

  const summary = useMemo(() => {
    const active =
      users.filter(
        (user) => user.active
      ).length

    const inactive =
      users.filter(
        (user) => !user.active
      ).length

    const admins =
      users.filter(
        (user) =>
          user.role === 'OWNER' ||
          user.role === 'ADMIN'
      ).length

    return {
      active,
      inactive,
      admins,
    }
  }, [users])

  const handleSearchSubmit = (
    event
  ) => {
    event.preventDefault()

    setPage(0)
    setAppliedSearch(
      search.trim()
    )
  }

  const handleClearSearch = () => {
    setSearch('')
    setAppliedSearch('')
    setPage(0)
  }

  const openCreateModal = () => {
    setSelectedUser(null)

    setForm({
      ...EMPTY_FORM,
      role:
        currentUser?.role === 'OWNER'
          ? 'EMPLOYEE'
          : 'EMPLOYEE',
    })

    setModal({
      open: true,
      mode: 'create',
    })
  }

  const loadAndOpenUser = async (
    user,
    mode
  ) => {
    try {
      const data =
        await userService.getById(
          user.id
        )

      setSelectedUser(data)

      if (mode === 'edit') {
        setForm({
          name: data.name || '',
          email: data.email || '',
          role:
            data.role ||
            'EMPLOYEE',
          password: '',
        })
      }

      setModal({
        open: true,
        mode,
      })
    } catch (error) {
      showToast(
        'error',
        getErrorMessage(
          error,
          'Não foi possível carregar o usuário.'
        )
      )
    }
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setModal({
      open: false,
      mode: 'create',
    })

    setSelectedUser(null)
    setForm(EMPTY_FORM)
  }

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    const normalizedName =
      form.name.trim()

    const normalizedEmail =
      form.email.trim()

    if (!normalizedName) {
      showToast(
        'error',
        'Informe o nome do usuário.'
      )
      return
    }

    if (!normalizedEmail) {
      showToast(
        'error',
        'Informe o e-mail do usuário.'
      )
      return
    }

    if (
      modal.mode === 'create' &&
      form.password.length < 8
    ) {
      showToast(
        'error',
        'A senha deve possuir pelo menos 8 caracteres.'
      )
      return
    }

    if (
      modal.mode === 'edit' &&
      form.password &&
      form.password.length < 8
    ) {
      showToast(
        'error',
        'A nova senha deve possuir pelo menos 8 caracteres.'
      )
      return
    }

    setSaving(true)

    try {
      if (
        modal.mode === 'create'
      ) {
        await userService.create({
          name: normalizedName,
          email: normalizedEmail,
          password: form.password,
          role: form.role,
        })

        showToast(
          'success',
          'Usuário cadastrado com sucesso.'
        )
      } else {
        const payload = {
          name: normalizedName,
          email: normalizedEmail,
          role: form.role,
        }

        if (
          form.password.trim()
        ) {
          payload.password =
            form.password
        }

        await userService.update(
          selectedUser.id,
          payload
        )

        showToast(
          'success',
          'Usuário atualizado com sucesso.'
        )
      }

      closeModal()
      await loadUsers()
    } catch (error) {
      showToast(
        'error',
        getErrorMessage(error)
      )
    } finally {
      setSaving(false)

      setModal({
        open: false,
        mode: 'create',
      })

      setSelectedUser(null)
      setForm(EMPTY_FORM)
    }
  }

  const canManageTarget = (
    user
  ) => {
    if (!canManage) {
      return false
    }

    if (
      currentUser?.role === 'ADMIN' &&
      user.role === 'OWNER'
    ) {
      return false
    }

    return true
  }

  const canChangeTargetStatus = (
    user
  ) => {
    if (!canManageTarget(user)) {
      return false
    }

    if (
      Number(user.id) ===
        currentUserId &&
      user.active
    ) {
      return false
    }

    return true
  }

  const handleStatusConfirm =
    async () => {
      if (!confirmUser) {
        return
      }

      setChangingStatus(true)

      try {
        const nextStatus =
          !confirmUser.active

        await userService.changeStatus(
          confirmUser.id,
          nextStatus
        )

        showToast(
          'success',
          nextStatus
            ? 'Usuário reativado com sucesso.'
            : 'Usuário desativado com sucesso.'
        )

        setConfirmUser(null)

        await loadUsers()
      } catch (error) {
        showToast(
          'error',
          getErrorMessage(error)
        )
      } finally {
        setChangingStatus(false)
      }
    }

  if (!canView) {
    return (
      <div className="user-page">
        <section className="user-access-denied">
          <div className="user-access-icon">
            !
          </div>

          <h2>Acesso restrito</h2>

          <p>
            Seu perfil não possui
            permissão para gerenciar os
            usuários da organização.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="user-page">
      <div className="user-page-header">
        <div>
          <h1>Usuários</h1>

          <p>
            Gerencie acessos, perfis e
            usuários da sua equipe.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            className="user-new-button"
            onClick={
              openCreateModal
            }
          >
            <span>+</span>
            Novo usuário
          </button>
        )}
      </div>

      <section className="user-summary-grid">
        <article className="user-summary-card">
          <span>
            Total de usuários
          </span>

          <strong>
            {pageInfo.totalElements}
          </strong>

          <small>
            Cadastrados na organização
          </small>
        </article>

        <article className="user-summary-card">
          <span>
            Ativos nesta página
          </span>

          <strong>
            {summary.active}
          </strong>

          <small>
            Com acesso liberado
          </small>
        </article>

        <article className="user-summary-card">
          <span>
            Inativos nesta página
          </span>

          <strong>
            {summary.inactive}
          </strong>

          <small>
            Com acesso desativado
          </small>
        </article>

        <article className="user-summary-card">
          <span>
            Gestão nesta página
          </span>

          <strong>
            {summary.admins}
          </strong>

          <small>
            Proprietários e administradores
          </small>
        </article>
      </section>

      <section className="user-table-card">
        <div className="user-table-toolbar">
          <form
            className="user-search-form"
            onSubmit={
              handleSearchSubmit
            }
          >
            <div className="user-search-input">
              <span>⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar por nome ou e-mail"
              />
            </div>

            <button
              type="submit"
              className="user-search-button"
            >
              Buscar
            </button>

            {appliedSearch && (
              <button
                type="button"
                className="user-clear-button"
                onClick={
                  handleClearSearch
                }
              >
                Limpar
              </button>
            )}
          </form>

          <span className="user-result-count">
            {pageInfo.totalElements}{' '}
            {pageInfo.totalElements === 1
              ? 'usuário encontrado'
              : 'usuários encontrados'}
          </span>
        </div>

        {loading ? (
          <div className="user-loading">
            <div className="user-spinner" />

            <span>
              Carregando usuários...
            </span>
          </div>
        ) : users.length === 0 ? (
          <div className="user-empty-state">
            <div className="user-empty-icon">
              U
            </div>

            <h3>
              Nenhum usuário encontrado
            </h3>

            <p>
              {appliedSearch
                ? 'Tente utilizar outro nome ou e-mail na busca.'
                : 'Ainda não existem usuários para exibir.'}
            </p>
          </div>
        ) : (
          <>
            <div className="user-table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Cadastro</th>
                    <th className="actions">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const isCurrentUser =
                      Number(user.id) ===
                      currentUserId

                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar">
                              {getInitials(
                                user.name
                              )}
                            </div>

                            <div>
                              <div className="user-name-line">
                                <strong>
                                  {user.name}
                                </strong>

                                {isCurrentUser && (
                                  <span className="user-you-badge">
                                    Você
                                  </span>
                                )}
                              </div>

                              <span>
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`user-role-badge ${String(
                              user.role
                            ).toLowerCase()}`}
                          >
                            {ROLE_LABELS[
                              user.role
                            ] ||
                              user.role}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`user-status-badge ${
                              user.active
                                ? 'active'
                                : 'inactive'
                            }`}
                          >
                            <span />

                            {user.active
                              ? 'Ativo'
                              : 'Inativo'}
                          </span>
                        </td>

                        <td>
                          <span className="user-date-cell">
                            {formatDateTime(
                              user.createdAt
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="user-actions">
                            <button
                              type="button"
                              onClick={() =>
                                loadAndOpenUser(
                                  user,
                                  'view'
                                )
                              }
                            >
                              Ver
                            </button>

                            {canManageTarget(
                              user
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  loadAndOpenUser(
                                    user,
                                    'edit'
                                  )
                                }
                              >
                                Editar
                              </button>
                            )}

                            {canChangeTargetStatus(
                              user
                            ) && (
                              <button
                                type="button"
                                className={
                                  user.active
                                    ? 'deactivate'
                                    : 'activate'
                                }
                                onClick={() =>
                                  setConfirmUser(
                                    user
                                  )
                                }
                              >
                                {user.active
                                  ? 'Desativar'
                                  : 'Reativar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="user-pagination">
              <span>
                Página{' '}
                <strong>
                  {pageInfo.number + 1}
                </strong>{' '}
                de{' '}
                <strong>
                  {Math.max(
                    pageInfo.totalPages,
                    1
                  )}
                </strong>
              </span>

              <div>
                <button
                  type="button"
                  disabled={
                    pageInfo.first ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          current - 1,
                          0
                        )
                    )
                  }
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={
                    pageInfo.last ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1
                    )
                  }
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {currentUser?.role ===
        'MANAGER' && (
        <div className="user-readonly-note">
          Seu perfil possui acesso de
          consulta. Criação e alterações
          de usuários são restritas a
          Proprietários e Administradores.
        </div>
      )}

      <UserModal
        open={modal.open}
        mode={modal.mode}
        form={form}
        selectedUser={selectedUser}
        currentUser={currentUser}
        saving={saving}
        onChange={
          handleFormChange
        }
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <ConfirmationModal
        open={
          Boolean(confirmUser)
        }
        user={confirmUser}
        loading={
          changingStatus
        }
        onCancel={() =>
          setConfirmUser(null)
        }
        onConfirm={
          handleStatusConfirm
        }
      />

      <Toast
        toast={toast}
        onClose={() =>
          setToast(null)
        }
      />
    </div>
  )
}

export default UserPage