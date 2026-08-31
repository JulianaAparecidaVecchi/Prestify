import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import authService
  from '../../services/authService'

import clientService
  from '../../services/clientService'

import './ClientPage.css'

const EMPTY_FORM = {
  name: '',
  document: '',
  email: '',
  phone: '',
  birthDate: '',
  notes: '',
}

const EDIT_ROLES = [
  'OWNER',
  'ADMIN',
  'MANAGER',
]

function ClientPage() {
  const user =
    authService.getUser()

  const role =
    user?.role || ''

  const canEdit =
    EDIT_ROLES.includes(role)

  const [
    clients,
    setClients,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const [
    toast,
    setToast,
  ] = useState(null)

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('ALL')

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
    modalMode,
    setModalMode,
  ] = useState('create')

  const [
    selectedClient,
    setSelectedClient,
  ] = useState(null)

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  )

  const [
    formError,
    setFormError,
  ] = useState('')

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false)

  const [
    detailsClient,
    setDetailsClient,
  ] = useState(null)

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null)

  const [
    exportOpen,
    setExportOpen,
  ] = useState(false)

  const [
    confirmModal,
    setConfirmModal,
  ] = useState(null)

  const showToast = (
    message
  ) => {
    setToast({
      message,
      type: 'success',
    })
  }

  const loadClients =
    useCallback(
      async () => {
        try {
          setLoading(true)

          setError('')

          const active =
            getActiveFilter(
              statusFilter
            )

          const response =
            await clientService.list({
              search:
                appliedSearch,
              active,
              page,
              size: 10,
            })

          setClients(
            response.content
              || []
          )

          setTotalPages(
            response.totalPages
              || 0
          )

          setTotalElements(
            response.totalElements
              || 0
          )
        } catch (
          requestError
        ) {
          console.error(
            'Erro ao carregar clientes:',
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
      },
      [
        appliedSearch,
        page,
        statusFilter,
      ]
    )

  useEffect(() => {
    loadClients()
  }, [loadClients])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeout =
      setTimeout(
        () => {
          setToast(null)
        },
        3500
      )

    return () =>
      clearTimeout(
        timeout
      )
  }, [toast])

  const handleSearch =
    (event) => {
      event.preventDefault()

      setPage(0)

      setAppliedSearch(
        search.trim()
      )
    }

  const handleClearSearch =
    () => {
      setSearch('')

      setAppliedSearch('')

      setPage(0)
    }

  const handleStatusChange =
    (event) => {
      setStatusFilter(
        event.target.value
      )

      setPage(0)
    }

  const openCreateModal =
    () => {
      setModalMode(
        'create'
      )

      setSelectedClient(
        null
      )

      setForm(
        EMPTY_FORM
      )

      setFormError('')

      setModalOpen(
        true
      )
    }

  const openEditModal =
    (client) => {
      setModalMode(
        'edit'
      )

      setSelectedClient(
        client
      )

      setForm({
        name:
          client.name || '',
        document:
          formatDocument(
            client.document
          ),
        email:
          client.email || '',
        phone:
          formatPhone(
            client.phone
          ),
        birthDate:
          client.birthDate
            || '',
        notes:
          client.notes || '',
      })

      setFormError('')

      setModalOpen(
        true
      )
    }

  const closeModal =
    () => {
      if (saving) {
        return
      }

      setModalOpen(
        false
      )

      setSelectedClient(
        null
      )

      setForm(
        EMPTY_FORM
      )

      setFormError('')
    }

  const handleFormChange =
    (event) => {
      const {
        name,
        value,
      } = event.target

      let formattedValue =
        value

      if (
        name === 'document'
      ) {
        formattedValue =
          applyDocumentMask(
            value
          )
      }

      if (
        name === 'phone'
      ) {
        formattedValue =
          applyPhoneMask(
            value
          )
      }

      setForm(
        (current) => ({
          ...current,
          [name]:
            formattedValue,
        })
      )
    }

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      const validation =
        validateForm(
          form
        )

      if (validation) {
        setFormError(
          validation
        )

        return
      }

      try {
        setSaving(
          true
        )

        setFormError('')

        if (
          modalMode
            === 'create'
        ) {
          await clientService
            .create(
              form
            )

          showToast(
            'Cliente cadastrado com sucesso.'
          )
        } else {
          await clientService
            .update(
              selectedClient.id,
              form
            )

          showToast(
            'Cliente atualizado com sucesso.'
          )
        }

        setModalOpen(
          false
        )

        setSelectedClient(
          null
        )

        setForm(
          EMPTY_FORM
        )

        await loadClients()
      } catch (
        requestError
      ) {
        console.error(
          'Erro ao salvar cliente:',
          requestError
        )

        setFormError(
          getErrorMessage(
            requestError
          )
        )
      } finally {
        setSaving(
          false
        )
      }
    }

  const openDetails =
    async (client) => {
      try {
        setActionLoading(
          client.id
        )

        const response =
          await clientService
            .getById(
              client.id
            )

        setDetailsClient(
          response
        )

        setDetailsOpen(
          true
        )
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError
          )
        )
      } finally {
        setActionLoading(
          null
        )
      }
    }

  const requestStatusChange =
    (client) => {
      setConfirmModal({
        type:
          client.active
            ? 'deactivate'
            : 'activate',
        client,
      })
    }

  const executeConfirmedAction =
    async () => {
      if (
        !confirmModal
          ?.client
      ) {
        return
      }

      const client =
        confirmModal.client

      const type =
        confirmModal.type

      try {
        setActionLoading(
          client.id
        )

        const newStatus =
          type
            === 'activate'

        await clientService
          .changeStatus(
            client.id,
            newStatus
          )

        showToast(
          newStatus
            ? 'Cliente reativado com sucesso.'
            : 'Cliente desativado com sucesso.'
        )

        setConfirmModal(
          null
        )

        await loadClients()
      } catch (
        requestError
      ) {
        setConfirmModal(
          null
        )

        setError(
          getErrorMessage(
            requestError
          )
        )
      } finally {
        setActionLoading(
          null
        )
      }
    }

  const handleExport =
    async (type) => {
      try {
        setExportOpen(
          false
        )

        const options = {
          search:
            appliedSearch,
          active:
            getActiveFilter(
              statusFilter
            ),
        }

        if (
          type === 'csv'
        ) {
          await clientService
            .exportCsv(
              options
            )

          showToast(
            'Arquivo CSV exportado com sucesso.'
          )
        } else {
          await clientService
            .exportPdf(
              options
            )

          showToast(
            'Arquivo PDF exportado com sucesso.'
          )
        }
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError
          )
        )
      }
    }

  return (
    <div className="client-page">
      {toast && (
        <SuccessToast
          message={
            toast.message
          }
          onClose={() =>
            setToast(
              null
            )
          }
        />
      )}

      <section className="client-header">
        <div>
          <span className="client-header-label">
            CADASTROS
          </span>

          <h1>
            Clientes
          </h1>

          <p>
            Gerencie os clientes
            cadastrados no seu
            negócio.
          </p>
        </div>

        <div className="client-header-actions">
          <div className="client-export-wrapper">
            <button
              type="button"
              className="client-secondary-button"
              onClick={() =>
                setExportOpen(
                  (current) =>
                    !current
                )
              }
            >
              <DownloadIcon />

              Exportar

              <ChevronDownIcon />
            </button>

            {exportOpen && (
              <div className="client-export-menu">
                <button
                  type="button"
                  onClick={() =>
                    handleExport(
                      'csv'
                    )
                  }
                >
                  Exportar CSV
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleExport(
                      'pdf'
                    )
                  }
                >
                  Exportar PDF
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="client-primary-button"
            onClick={
              openCreateModal
            }
          >
            <PlusIcon />

            Novo cliente
          </button>
        </div>
      </section>

      {error && (
        <div className="client-message client-message-error">
          <WarningIcon />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError('')
            }
          >
            ×
          </button>
        </div>
      )}

      <section className="client-summary">
        <div className="client-summary-card">
          <div className="client-summary-icon">
            <UsersIcon />
          </div>

          <div>
            <span>
              Clientes encontrados
            </span>

            <strong>
              {totalElements}
            </strong>
          </div>
        </div>

        <div className="client-summary-info">
          <InfoIcon />

          <span>
            Os resultados respeitam
            os filtros aplicados.
          </span>
        </div>
      </section>

      <section className="client-content">
        <div className="client-toolbar">
          <form
            className="client-search"
            onSubmit={
              handleSearch
            }
          >
            <SearchIcon />

            <input
              type="text"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="Buscar por nome, documento, e-mail ou telefone"
            />

            {search && (
              <button
                type="button"
                className="client-search-clear"
                onClick={
                  handleClearSearch
                }
                title="Limpar busca"
              >
                ×
              </button>
            )}

            <button
              type="submit"
              className="client-search-button"
            >
              Buscar
            </button>
          </form>

          <select
            className="client-status-filter"
            value={
              statusFilter
            }
            onChange={
              handleStatusChange
            }
          >
            <option value="ALL">
              Todos os status
            </option>

            <option value="ACTIVE">
              Ativos
            </option>

            <option value="INACTIVE">
              Inativos
            </option>
          </select>
        </div>

        {appliedSearch && (
          <div className="client-applied-filter">
            Resultados para:

            <strong>
              {' '}
              "
              {appliedSearch}
              "
            </strong>

            <button
              type="button"
              onClick={
                handleClearSearch
              }
            >
              Limpar
            </button>
          </div>
        )}

        {loading ? (
          <ClientLoading />
        ) : clients.length
          === 0 ? (
          <ClientEmpty
            onCreate={
              openCreateModal
            }
          />
        ) : (
          <>
            <div className="client-table-wrapper">
              <table className="client-table">
                <thead>
                  <tr>
                    <th>
                      Cliente
                    </th>

                    <th>
                      Documento
                    </th>

                    <th>
                      Telefone
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="client-table-actions-heading">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {clients.map(
                    (client) => (
                      <ClientRow
                        key={
                          client.id
                        }
                        client={
                          client
                        }
                        canEdit={
                          canEdit
                        }
                        loading={
                          actionLoading
                            === client.id
                        }
                        onDetails={() =>
                          openDetails(
                            client
                          )
                        }
                        onEdit={() =>
                          openEditModal(
                            client
                          )
                        }
                        onStatus={() =>
                          requestStatusChange(
                            client
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={
                page
              }
              totalPages={
                totalPages
              }
              totalElements={
                totalElements
              }
              onPageChange={
                setPage
              }
            />
          </>
        )}
      </section>

      {modalOpen && (
        <ClientModal
          mode={
            modalMode
          }
          form={
            form
          }
          error={
            formError
          }
          saving={
            saving
          }
          onChange={
            handleFormChange
          }
          onClose={
            closeModal
          }
          onSubmit={
            handleSubmit
          }
        />
      )}

      {detailsOpen
        && detailsClient && (
        <ClientDetailsModal
          client={
            detailsClient
          }
          canEdit={
            canEdit
          }
          onClose={() => {
            setDetailsOpen(
              false
            )

            setDetailsClient(
              null
            )
          }}
          onEdit={() => {
            setDetailsOpen(
              false
            )

            openEditModal(
              detailsClient
            )
          }}
        />
      )}

      {confirmModal && (
        <ConfirmationModal
          type={
            confirmModal.type
          }
          client={
            confirmModal.client
          }
          loading={
            actionLoading
              ===
            confirmModal
              .client
              .id
          }
          onConfirm={
            executeConfirmedAction
          }
          onClose={() =>
            setConfirmModal(
              null
            )
          }
        />
      )}
    </div>
  )
}

function ClientRow({
  client,
  canEdit,
  loading,
  onDetails,
  onEdit,
  onStatus,
}) {
  return (
    <tr>
      <td>
        <div className="client-person">
          <div className="client-avatar">
            {getInitials(
              client.name
            )}
          </div>

          <div>
            <strong>
              {client.name}
            </strong>

            <span>
              {client.email
                || 'E-mail não informado'}
            </span>
          </div>
        </div>
      </td>

      <td>
        {client.document
          ? formatDocument(
              client.document
            )
          : 'Não informado'}
      </td>

      <td>
        {formatPhone(
          client.phone
        )}
      </td>

      <td>
        <span
          className={`client-status ${
            client.active
              ? 'client-status-active'
              : 'client-status-inactive'
          }`}
        >
          <span />

          {client.active
            ? 'Ativo'
            : 'Inativo'}
        </span>
      </td>

      <td>
        <div className="client-row-actions">
          <button
            type="button"
            title="Visualizar cliente"
            disabled={
              loading
            }
            onClick={
              onDetails
            }
          >
            <EyeIcon />
          </button>

          {canEdit && (
            <>
              <button
                type="button"
                title="Editar cliente"
                disabled={
                  loading
                }
                onClick={
                  onEdit
                }
              >
                <EditIcon />
              </button>

              <button
                type="button"
                title={
                  client.active
                    ? 'Desativar cliente'
                    : 'Reativar cliente'
                }
                disabled={
                  loading
                }
                onClick={
                  onStatus
                }
              >
                {client.active
                  ? (
                    <DisableIcon />
                  )
                  : (
                    <EnableIcon />
                  )}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

function ConfirmationModal({
  type,
  client,
  loading,
  onConfirm,
  onClose,
}) {
  const isActivate =
    type === 'activate'

  const title =
    isActivate
      ? 'Reativar cliente?'
      : 'Desativar cliente?'

  const description =
    isActivate
      ? `O cliente "${client.name}" voltará a ficar disponível no sistema.`
      : `O cliente "${client.name}" ficará inativo e não será exibido entre os clientes ativos.`

  const buttonText =
    isActivate
      ? 'Reativar cliente'
      : 'Desativar cliente'

  return (
    <div
      className="client-modal-overlay"
      onMouseDown={
        loading
          ? undefined
          : onClose
      }
    >
      <div
        className="client-confirm-modal"
        onMouseDown={(
          event
        ) =>
          event
            .stopPropagation()
        }
      >
        <div
          className={`client-confirm-icon ${
            isActivate
              ? 'client-confirm-icon-success'
              : 'client-confirm-icon-warning'
          }`}
        >
          {isActivate
            ? (
              <EnableIcon />
            )
            : (
              <DisableIcon />
            )}
        </div>

        <div className="client-confirm-content">
          <h2>
            {title}
          </h2>

          <p>
            {description}
          </p>
        </div>

        <div className="client-confirm-footer">
          <button
            type="button"
            className="client-secondary-button"
            onClick={
              onClose
            }
            disabled={
              loading
            }
          >
            Cancelar
          </button>

          <button
            type="button"
            className={
              isActivate
                ? 'client-success-button'
                : 'client-warning-button'
            }
            onClick={
              onConfirm
            }
            disabled={
              loading
            }
          >
            {loading
              ? 'Processando...'
              : buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessToast({
  message,
  onClose,
}) {
  return (
    <div className="client-toast">
      <div className="client-toast-icon">
        <CheckIcon />
      </div>

      <div className="client-toast-content">
        <strong>
          Operação concluída
        </strong>

        <span>
          {message}
        </span>
      </div>

      <button
        type="button"
        className="client-toast-close"
        onClick={
          onClose
        }
      >
        ×
      </button>

      <div className="client-toast-progress" />
    </div>
  )
}

function ClientModal({
  mode,
  form,
  error,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  return (
    <div
      className="client-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="client-modal"
        onMouseDown={(
          event
        ) =>
          event
            .stopPropagation()
        }
      >
        <div className="client-modal-header">
          <div>
            <span>
              {mode === 'create'
                ? 'CADASTRO'
                : 'EDIÇÃO'}
            </span>

            <h2>
              {mode === 'create'
                ? 'Novo cliente'
                : 'Editar cliente'}
            </h2>

            <p>
              Preencha as informações
              do cliente.
            </p>
          </div>

          <button
            type="button"
            className="client-modal-close"
            onClick={
              onClose
            }
            disabled={
              saving
            }
          >
            ×
          </button>
        </div>

        <form
          onSubmit={
            onSubmit
          }
        >
          <div className="client-form-grid">
            <div className="client-form-group client-form-full">
              <label htmlFor="client-name">
                Nome *
              </label>

              <input
                id="client-name"
                name="name"
                type="text"
                maxLength="150"
                value={
                  form.name
                }
                onChange={
                  onChange
                }
                placeholder="Nome completo"
              />
            </div>

            <div className="client-form-group">
              <label htmlFor="client-document">
                CPF/CNPJ
              </label>

              <input
                id="client-document"
                name="document"
                type="text"
                maxLength="18"
                value={
                  form.document
                }
                onChange={
                  onChange
                }
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </div>

            <div className="client-form-group">
              <label htmlFor="client-birth-date">
                Data de nascimento
              </label>

              <input
                id="client-birth-date"
                name="birthDate"
                type="date"
                max={
                  today
                }
                value={
                  form.birthDate
                }
                onChange={
                  onChange
                }
              />
            </div>

            <div className="client-form-group">
              <label htmlFor="client-email">
                E-mail
              </label>

              <input
                id="client-email"
                name="email"
                type="email"
                maxLength="150"
                value={
                  form.email
                }
                onChange={
                  onChange
                }
                placeholder="cliente@email.com"
              />
            </div>

            <div className="client-form-group">
              <label htmlFor="client-phone">
                Telefone *
              </label>

              <input
                id="client-phone"
                name="phone"
                type="text"
                maxLength="15"
                value={
                  form.phone
                }
                onChange={
                  onChange
                }
                placeholder="(41) 99999-9999"
                inputMode="numeric"
              />
            </div>

            <div className="client-form-group client-form-full">
              <label htmlFor="client-notes">
                Observações
              </label>

              <textarea
                id="client-notes"
                name="notes"
                rows="4"
                value={
                  form.notes
                }
                onChange={
                  onChange
                }
                placeholder="Informações adicionais sobre o cliente..."
              />
            </div>
          </div>

          {error && (
            <div className="client-form-error">
              <WarningIcon />

              <span>
                {error}
              </span>
            </div>
          )}

          <div className="client-modal-footer">
            <button
              type="button"
              className="client-secondary-button"
              onClick={
                onClose
              }
              disabled={
                saving
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="client-primary-button"
              disabled={
                saving
              }
            >
              {saving
                ? 'Salvando...'
                : mode
                    === 'create'
                  ? 'Cadastrar cliente'
                  : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClientDetailsModal({
  client,
  canEdit,
  onClose,
  onEdit,
}) {
  return (
    <div
      className="client-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="client-modal client-details-modal"
        onMouseDown={(
          event
        ) =>
          event
            .stopPropagation()
        }
      >
        <div className="client-modal-header">
          <div>
            <span>
              DETALHES
            </span>

            <h2>
              {client.name}
            </h2>

            <p>
              Informações cadastradas
              do cliente.
            </p>
          </div>

          <button
            type="button"
            className="client-modal-close"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </div>

        <div className="client-details-profile">
          <div className="client-details-avatar">
            {getInitials(
              client.name
            )}
          </div>

          <div>
            <strong>
              {client.name}
            </strong>

            <span
              className={`client-status ${
                client.active
                  ? 'client-status-active'
                  : 'client-status-inactive'
              }`}
            >
              <span />

              {client.active
                ? 'Ativo'
                : 'Inativo'}
            </span>
          </div>
        </div>

        <div className="client-details-grid">
          <DetailItem
            label="CPF/CNPJ"
            value={
              client.document
                ? formatDocument(
                    client.document
                  )
                : null
            }
          />

          <DetailItem
            label="Telefone"
            value={
              formatPhone(
                client.phone
              )
            }
          />

          <DetailItem
            label="E-mail"
            value={
              client.email
            }
          />

          <DetailItem
            label="Data de nascimento"
            value={
              formatDate(
                client.birthDate
              )
            }
          />

          <DetailItem
            label="Cadastrado em"
            value={
              formatDateTime(
                client.createdAt
              )
            }
          />

          <DetailItem
            label="Última atualização"
            value={
              formatDateTime(
                client.updatedAt
              )
            }
          />
        </div>

        <div className="client-details-notes">
          <span>
            Observações
          </span>

          <p>
            {client.notes
              || 'Nenhuma observação cadastrada.'}
          </p>
        </div>

        <div className="client-modal-footer">
          <button
            type="button"
            className="client-secondary-button"
            onClick={
              onClose
            }
          >
            Fechar
          </button>

          {canEdit && (
            <button
              type="button"
              className="client-primary-button"
              onClick={
                onEdit
              }
            >
              <EditIcon />

              Editar cliente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="client-detail-item">
      <span>
        {label}
      </span>

      <strong>
        {value
          || 'Não informado'}
      </strong>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}) {
  if (
    totalPages <= 1
  ) {
    return (
      <div className="client-pagination client-pagination-single">
        <span>
          {totalElements}{' '}
          {totalElements
            === 1
            ? 'cliente'
            : 'clientes'}
        </span>
      </div>
    )
  }

  return (
    <div className="client-pagination">
      <span>
        Página {page + 1}
        {' '}
        de
        {' '}
        {totalPages}
      </span>

      <div>
        <button
          type="button"
          disabled={
            page === 0
          }
          onClick={() =>
            onPageChange(
              page - 1
            )
          }
        >
          <ChevronLeftIcon />

          Anterior
        </button>

        <button
          type="button"
          disabled={
            page
              >= totalPages - 1
          }
          onClick={() =>
            onPageChange(
              page + 1
            )
          }
        >
          Próxima

          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}

function ClientLoading() {
  return (
    <div className="client-loading">
      <div className="client-spinner" />

      <span>
        Carregando clientes...
      </span>
    </div>
  )
}

function ClientEmpty({
  onCreate,
}) {
  return (
    <div className="client-empty">
      <div className="client-empty-icon">
        <UsersIcon />
      </div>

      <strong>
        Nenhum cliente encontrado
      </strong>

      <p>
        Cadastre um novo cliente
        ou altere os filtros de
        busca.
      </p>

      <button
        type="button"
        className="client-primary-button"
        onClick={
          onCreate
        }
      >
        <PlusIcon />

        Novo cliente
      </button>
    </div>
  )
}

function getActiveFilter(
  status
) {
  if (
    status === 'ACTIVE'
  ) {
    return true
  }

  if (
    status === 'INACTIVE'
  ) {
    return false
  }

  return null
}

function validateForm(
  form
) {
  if (
    !form.name.trim()
  ) {
    return 'Informe o nome do cliente.'
  }

  if (
    form.name
      .trim()
      .length > 150
  ) {
    return 'O nome deve possuir no máximo 150 caracteres.'
  }

  if (
    form.document
      && !isValidCpfOrCnpj(
        form.document
      )
  ) {
    return 'Informe um CPF ou CNPJ válido.'
  }

  if (
    form.email.length
      > 150
  ) {
    return 'O e-mail deve possuir no máximo 150 caracteres.'
  }

  if (
    form.email
      && !isValidEmail(
        form.email
      )
  ) {
    return 'Informe um e-mail válido.'
  }

  if (
    !form.phone.trim()
  ) {
    return 'Informe o telefone do cliente.'
  }

  if (
    !isValidPhone(
      form.phone
    )
  ) {
    return 'Informe um telefone válido com DDD.'
  }

  if (
    form.birthDate
  ) {
    const selectedDate =
      new Date(
        `${form.birthDate}T00:00:00`
      )

    const today =
      new Date()

    today.setHours(
      0,
      0,
      0,
      0
    )

    if (
      selectedDate
        > today
    ) {
      return 'A data de nascimento não pode estar no futuro.'
    }
  }

  return ''
}

function onlyDigits(
  value
) {
  if (!value) {
    return ''
  }

  return value.replace(
    /\D/g,
    ''
  )
}

function isValidCpfOrCnpj(
  value
) {
  const digits =
    onlyDigits(
      value
    )

  if (
    digits.length
      === 11
  ) {
    return isValidCpf(
      digits
    )
  }

  if (
    digits.length
      === 14
  ) {
    return isValidCnpj(
      digits
    )
  }

  return false
}

function isValidCpf(
  cpf
) {
  if (
    cpf.length !== 11
    || /^(\d)\1+$/
      .test(
        cpf
      )
  ) {
    return false
  }

  const calculateDigit = (
    value,
    initialWeight
  ) => {
    let sum = 0

    let weight =
      initialWeight

    for (
      let i = 0;
      i < value.length;
      i += 1
    ) {
      sum +=
        Number(
          value[i]
        )
        * weight

      weight -= 1
    }

    const remainder =
      sum % 11

    return remainder < 2
      ? 0
      : 11 - remainder
  }

  const firstDigit =
    calculateDigit(
      cpf.substring(
        0,
        9
      ),
      10
    )

  const secondDigit =
    calculateDigit(
      cpf.substring(
        0,
        9
      )
        + firstDigit,
      11
    )

  return (
    firstDigit
      === Number(
        cpf[9]
      )
    &&
    secondDigit
      === Number(
        cpf[10]
      )
  )
}

function isValidCnpj(
  cnpj
) {
  if (
    cnpj.length !== 14
    || /^(\d)\1+$/
      .test(
        cnpj
      )
  ) {
    return false
  }

  const calculateDigit = (
    value
  ) => {
    const weights =
      value.length === 12
        ? [
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
        : [
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

    let sum = 0

    for (
      let i = 0;
      i < value.length;
      i += 1
    ) {
      sum +=
        Number(
          value[i]
        )
        * weights[i]
    }

    const remainder =
      sum % 11

    return remainder < 2
      ? 0
      : 11 - remainder
  }

  const firstDigit =
    calculateDigit(
      cnpj.substring(
        0,
        12
      )
    )

  const secondDigit =
    calculateDigit(
      cnpj.substring(
        0,
        12
      )
        + firstDigit
    )

  return (
    firstDigit
      === Number(
        cnpj[12]
      )
    &&
    secondDigit
      === Number(
        cnpj[13]
      )
  )
}

function isValidPhone(
  value
) {
  const digits =
    onlyDigits(
      value
    )

  if (
    digits.length !== 10
    && digits.length !== 11
  ) {
    return false
  }

  const ddd =
    Number(
      digits.substring(
        0,
        2
      )
    )

  if (
    ddd < 11
  ) {
    return false
  }

  if (
    digits.length === 11
    && digits[2] !== '9'
  ) {
    return false
  }

  if (
    /^(\d)\1+$/
      .test(
        digits
      )
  ) {
    return false
  }

  return true
}

function isValidEmail(
  email
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      email
    )
}

function applyDocumentMask(
  value
) {
  let digits =
    onlyDigits(
      value
    )
      .slice(
        0,
        14
      )

  if (
    digits.length
      <= 11
  ) {
    digits =
      digits.replace(
        /^(\d{3})(\d)/,
        '$1.$2'
      )

    digits =
      digits.replace(
        /^(\d{3})\.(\d{3})(\d)/,
        '$1.$2.$3'
      )

    digits =
      digits.replace(
        /\.(\d{3})(\d)/,
        '.$1-$2'
      )

    return digits
  }

  digits =
    digits.replace(
      /^(\d{2})(\d)/,
      '$1.$2'
    )

  digits =
    digits.replace(
      /^(\d{2})\.(\d{3})(\d)/,
      '$1.$2.$3'
    )

  digits =
    digits.replace(
      /\.(\d{3})(\d)/,
      '.$1/$2'
    )

  digits =
    digits.replace(
      /(\d{4})(\d)/,
      '$1-$2'
    )

  return digits
}

function applyPhoneMask(
  value
) {
  const digits =
    onlyDigits(
      value
    )
      .slice(
        0,
        11
      )

  if (
    digits.length === 0
  ) {
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
    return `(${digits.slice(
      0,
      2
    )}) ${digits.slice(
      2
    )}`
  }

  if (
    digits.length <= 10
  ) {
    return `(${digits.slice(
      0,
      2
    )}) ${digits.slice(
      2,
      6
    )}-${digits.slice(
      6
    )}`
  }

  return `(${digits.slice(
    0,
    2
  )}) ${digits.slice(
    2,
    7
  )}-${digits.slice(
    7
  )}`
}

function formatDocument(
  value
) {
  if (!value) {
    return ''
  }

  const digits =
    onlyDigits(
      value
    )

  if (
    digits.length === 11
  ) {
    return `${digits.slice(
      0,
      3
    )}.${digits.slice(
      3,
      6
    )}.${digits.slice(
      6,
      9
    )}-${digits.slice(
      9
    )}`
  }

  if (
    digits.length === 14
  ) {
    return `${digits.slice(
      0,
      2
    )}.${digits.slice(
      2,
      5
    )}.${digits.slice(
      5,
      8
    )}/${digits.slice(
      8,
      12
    )}-${digits.slice(
      12
    )}`
  }

  return value
}

function formatPhone(
  value
) {
  if (!value) {
    return ''
  }

  const digits =
    onlyDigits(
      value
    )

  if (
    digits.length === 11
  ) {
    return `(${digits.slice(
      0,
      2
    )}) ${digits.slice(
      2,
      7
    )}-${digits.slice(
      7
    )}`
  }

  if (
    digits.length === 10
  ) {
    return `(${digits.slice(
      0,
      2
    )}) ${digits.slice(
      2,
      6
    )}-${digits.slice(
      6
    )}`
  }

  return value
}

function getErrorMessage(
  error
) {
  const responseData =
    error.response
      ?.data

  if (
    responseData
      ?.message
  ) {
    return responseData
      .message
  }

  if (
    responseData
      ?.errors
  ) {
    if (
      Array.isArray(
        responseData
          .errors
      )
    ) {
      return responseData
        .errors
        .map(
          (item) =>
            item.message
            || item.defaultMessage
            || item
        )
        .join(' ')
    }

    if (
      typeof
        responseData
          .errors
        === 'object'
    ) {
      return Object
        .values(
          responseData
            .errors
        )
        .join(' ')
    }
  }

  if (
    error.response
      ?.status === 403
  ) {
    return 'Seu usuário não possui permissão para realizar esta ação.'
  }

  if (
    error.response
      ?.status === 401
  ) {
    return 'Sua sessão expirou. Faça login novamente.'
  }

  return 'Não foi possível concluir a operação.'
}

function getInitials(
  name
) {
  if (!name) {
    return '?'
  }

  const parts =
    name
      .trim()
      .split(
        /\s+/
      )

  if (
    parts.length
      === 1
  ) {
    return parts[0]
      .charAt(0)
      .toUpperCase()
  }

  return (
    parts[0]
      .charAt(0)
      +
    parts[
      parts.length - 1
    ]
      .charAt(0)
  ).toUpperCase()
}

function formatDate(
  value
) {
  if (!value) {
    return null
  }

  const [
    year,
    month,
    day,
  ] =
    value.split('-')

  if (
    !year
    || !month
    || !day
  ) {
    return value
  }

  return `${day}/${month}/${year}`
}

function formatDateTime(
  value
) {
  if (!value) {
    return null
  }

  const date =
    new Date(
      value
    )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return new Intl
    .DateTimeFormat(
      'pt-BR',
      {
        dateStyle:
          'short',
        timeStyle:
          'short',
      }
    )
    .format(
      date
    )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
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

      <path d="m20 20-4-4" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
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

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m4 20 4.5-1 10-10a2 2 0 0 0-3-3l-10 10L4 20Z" />

      <path d="m14 7 3 3" />
    </svg>
  )
}

function DisableIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="m6 6 12 12" />
    </svg>
  )
}

function EnableIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m7 9 5 5 5-5" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12.5 10 17l9-10" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 11v6M12 7h.01" />
    </svg>
  )
}

export default ClientPage