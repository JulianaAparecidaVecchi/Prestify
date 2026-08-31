import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import authService
  from '../../services/authService'

import serviceService
  from '../../services/serviceService'

import './ServicePage.css'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  durationMinutes: '',
}

const MANAGE_ROLES = [
  'OWNER',
  'ADMIN',
  'MANAGER',
]

function ServicePage() {
  const user =
    authService.getUser()

  const role =
    user?.role || ''

  const canManage =
    MANAGE_ROLES.includes(
      role
    )

  const [
    services,
    setServices,
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
    selectedService,
    setSelectedService,
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
    detailsService,
    setDetailsService,
  ] = useState(null)

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null)

  const [
    confirmModal,
    setConfirmModal,
  ] = useState(null)

  const showToast = (
    message
  ) => {
    setToast({
      message,
    })
  }

  const loadServices =
    useCallback(
      async () => {
        try {
          setLoading(true)

          setError('')

          const response =
            await serviceService.list({
              search:
                appliedSearch,

              active:
                getActiveFilter(
                  statusFilter
                ),

              page,
              size: 10,
            })

          setServices(
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
            'Erro ao carregar serviços:',
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
    loadServices()
  }, [loadServices])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer =
      setTimeout(
        () => {
          setToast(null)
        },
        3500
      )

    return () =>
      clearTimeout(
        timer
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

      setSelectedService(
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
    (service) => {
      setModalMode(
        'edit'
      )

      setSelectedService(
        service
      )

      setForm({
        name:
          service.name || '',

        description:
          service.description
            || '',

        price:
          service.price
            ?? '',

        durationMinutes:
          service.durationMinutes
            ?? '',
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

      setSelectedService(
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

      let newValue =
        value

      if (
        name
        === 'durationMinutes'
      ) {
        newValue =
          value.replace(
            /\D/g,
            ''
          )
      }

      if (
        name === 'price'
      ) {
        newValue =
          normalizePriceInput(
            value
          )
      }

      setForm(
        (current) => ({
          ...current,
          [name]:
            newValue,
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
        setSaving(true)

        setFormError('')

        if (
          modalMode
            === 'create'
        ) {
          await serviceService
            .create(
              form
            )

          showToast(
            'Serviço cadastrado com sucesso.'
          )
        } else {
          await serviceService
            .update(
              selectedService.id,
              form
            )

          showToast(
            'Serviço atualizado com sucesso.'
          )
        }

        setModalOpen(
          false
        )

        setSelectedService(
          null
        )

        setForm(
          EMPTY_FORM
        )

        await loadServices()
      } catch (
        requestError
      ) {
        console.error(
          'Erro ao salvar serviço:',
          requestError
        )

        setFormError(
          getErrorMessage(
            requestError
          )
        )
      } finally {
        setSaving(false)
      }
    }

  const openDetails =
    async (service) => {
      try {
        setActionLoading(
          service.id
        )

        const response =
          await serviceService
            .getById(
              service.id
            )

        setDetailsService(
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
    (service) => {
      setConfirmModal({
        type:
          service.active
            ? 'deactivate'
            : 'activate',

        service,
      })
    }

  const executeStatusChange =
    async () => {
      if (
        !confirmModal
          ?.service
      ) {
        return
      }

      const service =
        confirmModal.service

      const newStatus =
        confirmModal.type
          === 'activate'

      try {
        setActionLoading(
          service.id
        )

        await serviceService
          .changeStatus(
            service.id,
            newStatus
          )

        showToast(
          newStatus
            ? 'Serviço reativado com sucesso.'
            : 'Serviço desativado com sucesso.'
        )

        setConfirmModal(
          null
        )

        await loadServices()
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

  return (
    <div className="service-page">
      {toast && (
        <SuccessToast
          message={
            toast.message
          }
          onClose={() =>
            setToast(null)
          }
        />
      )}

      <section className="service-header">
        <div>
          <span className="service-header-label">
            CATÁLOGO
          </span>

          <h1>
            Serviços
          </h1>

          <p>
            Gerencie os serviços
            oferecidos pelo seu
            negócio.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            className="service-primary-button"
            onClick={
              openCreateModal
            }
          >
            <PlusIcon />

            Novo serviço
          </button>
        )}
      </section>

      {error && (
        <div className="service-message service-message-error">
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

      <section className="service-summary-grid">
        <SummaryCard
          title="Serviços encontrados"
          value={
            totalElements
          }
          icon={
            <ServiceIcon />
          }
        />

        <SummaryCard
          title="Status do filtro"
          value={
            getStatusLabel(
              statusFilter
            )
          }
          icon={
            <FilterIcon />
          }
        />
      </section>

      <section className="service-content">
        <div className="service-toolbar">
          <form
            className="service-search"
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
              placeholder="Buscar por nome ou descrição"
            />

            {search && (
              <button
                type="button"
                className="service-search-clear"
                onClick={
                  handleClearSearch
                }
              >
                ×
              </button>
            )}

            <button
              type="submit"
              className="service-search-button"
            >
              Buscar
            </button>
          </form>

          <select
            className="service-status-filter"
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
          <div className="service-applied-filter">
            Resultados para:

            <strong>
              {' '}
              "{appliedSearch}"
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
          <ServiceLoading />
        ) : services.length
          === 0 ? (
          <ServiceEmpty
            canManage={
              canManage
            }
            onCreate={
              openCreateModal
            }
          />
        ) : (
          <>
            <div className="service-table-wrapper">
              <table className="service-table">
                <thead>
                  <tr>
                    <th>
                      Serviço
                    </th>

                    <th>
                      Preço
                    </th>

                    <th>
                      Duração
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="service-actions-heading">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {services.map(
                    (service) => (
                      <ServiceRow
                        key={
                          service.id
                        }
                        service={
                          service
                        }
                        canManage={
                          canManage
                        }
                        loading={
                          actionLoading
                            === service.id
                        }
                        onDetails={() =>
                          openDetails(
                            service
                          )
                        }
                        onEdit={() =>
                          openEditModal(
                            service
                          )
                        }
                        onStatus={() =>
                          requestStatusChange(
                            service
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
        <ServiceModal
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
        && detailsService && (
        <ServiceDetailsModal
          service={
            detailsService
          }
          canManage={
            canManage
          }
          onClose={() => {
            setDetailsOpen(
              false
            )

            setDetailsService(
              null
            )
          }}
          onEdit={() => {
            setDetailsOpen(
              false
            )

            openEditModal(
              detailsService
            )
          }}
        />
      )}

      {confirmModal && (
        <ConfirmationModal
          type={
            confirmModal.type
          }
          service={
            confirmModal.service
          }
          loading={
            actionLoading
              ===
            confirmModal
              .service
              .id
          }
          onConfirm={
            executeStatusChange
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

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="service-summary-card">
      <div className="service-summary-icon">
        {icon}
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>
      </div>
    </div>
  )
}

function ServiceRow({
  service,
  canManage,
  loading,
  onDetails,
  onEdit,
  onStatus,
}) {
  return (
    <tr>
      <td>
        <div className="service-main-cell">
          <div className="service-icon-box">
            <ServiceIcon />
          </div>

          <div>
            <strong>
              {service.name}
            </strong>

            <span>
              {service.description
                || 'Sem descrição'}
            </span>
          </div>
        </div>
      </td>

      <td>
        <strong className="service-price">
          {formatCurrency(
            service.price
          )}
        </strong>
      </td>

      <td>
        {formatDuration(
          service.durationMinutes
        )}
      </td>

      <td>
        <span
          className={`service-status ${
            service.active
              ? 'service-status-active'
              : 'service-status-inactive'
          }`}
        >
          <span />

          {service.active
            ? 'Ativo'
            : 'Inativo'}
        </span>
      </td>

      <td>
        <div className="service-row-actions">
          <button
            type="button"
            title="Visualizar serviço"
            disabled={
              loading
            }
            onClick={
              onDetails
            }
          >
            <EyeIcon />
          </button>

          {canManage && (
            <>
              <button
                type="button"
                title="Editar serviço"
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
                  service.active
                    ? 'Desativar serviço'
                    : 'Reativar serviço'
                }
                disabled={
                  loading
                }
                onClick={
                  onStatus
                }
              >
                {service.active
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

function ServiceModal({
  mode,
  form,
  error,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="service-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="service-modal"
        onMouseDown={(
          event
        ) =>
          event
            .stopPropagation()
        }
      >
        <div className="service-modal-header">
          <div>
            <span>
              {mode === 'create'
                ? 'CADASTRO'
                : 'EDIÇÃO'}
            </span>

            <h2>
              {mode === 'create'
                ? 'Novo serviço'
                : 'Editar serviço'}
            </h2>

            <p>
              Informe os dados do
              serviço oferecido.
            </p>
          </div>

          <button
            type="button"
            className="service-modal-close"
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
          <div className="service-form-grid">
            <div className="service-form-group service-form-full">
              <label htmlFor="service-name">
                Nome do serviço *
              </label>

              <input
                id="service-name"
                type="text"
                name="name"
                maxLength="150"
                value={
                  form.name
                }
                onChange={
                  onChange
                }
                placeholder="Ex.: Corte masculino"
              />
            </div>

            <div className="service-form-group">
              <label htmlFor="service-price">
                Preço *
              </label>

              <div className="service-price-input">
                <span>
                  R$
                </span>

                <input
                  id="service-price"
                  type="text"
                  name="price"
                  inputMode="decimal"
                  value={
                    form.price
                  }
                  onChange={
                    onChange
                  }
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="service-form-group">
              <label htmlFor="service-duration">
                Duração *
              </label>

              <div className="service-duration-input">
                <input
                  id="service-duration"
                  type="text"
                  name="durationMinutes"
                  inputMode="numeric"
                  maxLength="5"
                  value={
                    form.durationMinutes
                  }
                  onChange={
                    onChange
                  }
                  placeholder="60"
                />

                <span>
                  minutos
                </span>
              </div>
            </div>

            <div className="service-duration-preview service-form-full">
              <ClockIcon />

              <span>
                Duração:
                {' '}
                <strong>
                  {form.durationMinutes
                    ? formatDuration(
                        Number(
                          form.durationMinutes
                        )
                      )
                    : 'não informada'}
                </strong>
              </span>
            </div>

            <div className="service-form-group service-form-full">
              <label htmlFor="service-description">
                Descrição
              </label>

              <textarea
                id="service-description"
                name="description"
                rows="5"
                maxLength="2000"
                value={
                  form.description
                }
                onChange={
                  onChange
                }
                placeholder="Descreva o que está incluído neste serviço..."
              />

              <span className="service-character-count">
                {form.description.length}
                /2000
              </span>
            </div>
          </div>

          {error && (
            <div className="service-form-error">
              <WarningIcon />

              <span>
                {error}
              </span>
            </div>
          )}

          <div className="service-modal-footer">
            <button
              type="button"
              className="service-secondary-button"
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
              className="service-primary-button"
              disabled={
                saving
              }
            >
              {saving
                ? 'Salvando...'
                : mode
                    === 'create'
                  ? 'Cadastrar serviço'
                  : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ServiceDetailsModal({
  service,
  canManage,
  onClose,
  onEdit,
}) {
  return (
    <div
      className="service-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="service-modal service-details-modal"
        onMouseDown={(
          event
        ) =>
          event
            .stopPropagation()
        }
      >
        <div className="service-modal-header">
          <div>
            <span>
              DETALHES
            </span>

            <h2>
              {service.name}
            </h2>

            <p>
              Informações cadastradas
              do serviço.
            </p>
          </div>

          <button
            type="button"
            className="service-modal-close"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </div>

        <div className="service-details-hero">
          <div className="service-details-icon">
            <ServiceIcon />
          </div>

          <div>
            <strong>
              {service.name}
            </strong>

            <span
              className={`service-status ${
                service.active
                  ? 'service-status-active'
                  : 'service-status-inactive'
              }`}
            >
              <span />

              {service.active
                ? 'Ativo'
                : 'Inativo'}
            </span>
          </div>
        </div>

        <div className="service-details-grid">
          <DetailItem
            label="Preço"
            value={
              formatCurrency(
                service.price
              )
            }
          />

          <DetailItem
            label="Duração"
            value={
              formatDuration(
                service.durationMinutes
              )
            }
          />

          <DetailItem
            label="Cadastrado em"
            value={
              formatDateTime(
                service.createdAt
              )
            }
          />

          <DetailItem
            label="Última atualização"
            value={
              formatDateTime(
                service.updatedAt
              )
            }
          />
        </div>

        <div className="service-details-description">
          <span>
            Descrição
          </span>

          <p>
            {service.description
              || 'Nenhuma descrição cadastrada.'}
          </p>
        </div>

        <div className="service-modal-footer">
          <button
            type="button"
            className="service-secondary-button"
            onClick={
              onClose
            }
          >
            Fechar
          </button>

          {canManage && (
            <button
              type="button"
              className="service-primary-button"
              onClick={
                onEdit
              }
            >
              <EditIcon />

              Editar serviço
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmationModal({
  type,
  service,
  loading,
  onConfirm,
  onClose,
}) {
  const isActivate =
    type === 'activate'

  return (
    <div
      className="service-modal-overlay"
      onMouseDown={
        loading
          ? undefined
          : onClose
      }
    >
      <div
        className="service-confirm-modal"
        onMouseDown={(
          event
        ) =>
          event
            .stopPropagation()
        }
      >
        <div
          className={`service-confirm-icon ${
            isActivate
              ? 'service-confirm-icon-success'
              : 'service-confirm-icon-warning'
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

        <div className="service-confirm-content">
          <h2>
            {isActivate
              ? 'Reativar serviço?'
              : 'Desativar serviço?'}
          </h2>

          <p>
            {isActivate
              ? `O serviço "${service.name}" voltará a ficar disponível no sistema.`
              : `O serviço "${service.name}" ficará inativo. Os registros históricos serão preservados.`}
          </p>
        </div>

        <div className="service-confirm-footer">
          <button
            type="button"
            className="service-secondary-button"
            disabled={
              loading
            }
            onClick={
              onClose
            }
          >
            Cancelar
          </button>

          <button
            type="button"
            className={
              isActivate
                ? 'service-success-button'
                : 'service-warning-button'
            }
            disabled={
              loading
            }
            onClick={
              onConfirm
            }
          >
            {loading
              ? 'Processando...'
              : isActivate
                ? 'Reativar serviço'
                : 'Desativar serviço'}
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
    <div className="service-toast">
      <div className="service-toast-icon">
        <CheckIcon />
      </div>

      <div className="service-toast-content">
        <strong>
          Operação concluída
        </strong>

        <span>
          {message}
        </span>
      </div>

      <button
        type="button"
        className="service-toast-close"
        onClick={
          onClose
        }
      >
        ×
      </button>

      <div className="service-toast-progress" />
    </div>
  )
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="service-detail-item">
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
      <div className="service-pagination service-pagination-single">
        <span>
          {totalElements}
          {' '}
          {totalElements
            === 1
            ? 'serviço'
            : 'serviços'}
        </span>
      </div>
    )
  }

  return (
    <div className="service-pagination">
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

function ServiceLoading() {
  return (
    <div className="service-loading">
      <div className="service-spinner" />

      <span>
        Carregando serviços...
      </span>
    </div>
  )
}

function ServiceEmpty({
  canManage,
  onCreate,
}) {
  return (
    <div className="service-empty">
      <div className="service-empty-icon">
        <ServiceIcon />
      </div>

      <strong>
        Nenhum serviço encontrado
      </strong>

      <p>
        Cadastre um serviço
        ou altere os filtros
        utilizados.
      </p>

      {canManage && (
        <button
          type="button"
          className="service-primary-button"
          onClick={
            onCreate
          }
        >
          <PlusIcon />

          Novo serviço
        </button>
      )}
    </div>
  )
}

function validateForm(
  form
) {
  const name =
    form.name.trim()

  if (!name) {
    return 'Informe o nome do serviço.'
  }

  if (
    name.length > 150
  ) {
    return 'O nome deve possuir no máximo 150 caracteres.'
  }

  if (
    form.description
      .trim()
      .length > 2000
  ) {
    return 'A descrição deve possuir no máximo 2000 caracteres.'
  }

  if (
    form.price === ''
    || form.price === null
  ) {
    return 'Informe o preço do serviço.'
  }

  const price =
    Number(
      form.price
    )

  if (
    Number.isNaN(
      price
    )
  ) {
    return 'Informe um preço válido.'
  }

  if (
    price < 0
  ) {
    return 'O preço não pode ser negativo.'
  }

  if (
    form.durationMinutes
      === ''
  ) {
    return 'Informe a duração do serviço.'
  }

  const duration =
    Number(
      form.durationMinutes
    )

  if (
    !Number.isInteger(
      duration
    )
  ) {
    return 'A duração deve ser informada em minutos inteiros.'
  }

  if (
    duration < 1
  ) {
    return 'A duração deve ser de pelo menos 1 minuto.'
  }

  if (
    duration > 10080
  ) {
    return 'A duração não pode ultrapassar 10080 minutos.'
  }

  return ''
}

function normalizePriceInput(
  value
) {
  let normalized =
    value
      .replace(
        ',',
        '.'
      )
      .replace(
        /[^0-9.]/g,
        ''
      )

  const firstDot =
    normalized.indexOf('.')

  if (
    firstDot !== -1
  ) {
    normalized =
      normalized.slice(
        0,
        firstDot + 1
      )
      +
      normalized
        .slice(
          firstDot + 1
        )
        .replace(
          /\./g,
          ''
        )
  }

  const parts =
    normalized.split('.')

  if (
    parts.length === 2
  ) {
    normalized =
      `${parts[0]}.${parts[1].slice(
        0,
        2
      )}`
  }

  return normalized
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

function getStatusLabel(
  status
) {
  if (
    status === 'ACTIVE'
  ) {
    return 'Ativos'
  }

  if (
    status === 'INACTIVE'
  ) {
    return 'Inativos'
  }

  return 'Todos'
}

function formatCurrency(
  value
) {
  const number =
    Number(
      value
    )

  if (
    Number.isNaN(
      number
    )
  ) {
    return 'R$ 0,00'
  }

  return new Intl
    .NumberFormat(
      'pt-BR',
      {
        style:
          'currency',

        currency:
          'BRL',
      }
    )
    .format(
      number
    )
}

function formatDuration(
  minutes
) {
  const total =
    Number(
      minutes
    )

  if (
    Number.isNaN(
      total
    )
    || total <= 0
  ) {
    return 'Não informado'
  }

  if (
    total < 60
  ) {
    return `${total} min`
  }

  const days =
    Math.floor(
      total / 1440
    )

  const remainingAfterDays =
    total % 1440

  const hours =
    Math.floor(
      remainingAfterDays / 60
    )

  const remainingMinutes =
    remainingAfterDays % 60

  const parts = []

  if (days > 0) {
    parts.push(
      `${days} ${
        days === 1
          ? 'dia'
          : 'dias'
      }`
    )
  }

  if (hours > 0) {
    parts.push(
      `${hours}h`
    )
  }

  if (
    remainingMinutes > 0
  ) {
    parts.push(
      `${remainingMinutes}min`
    )
  }

  return parts.join(' ')
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
        responseData.errors
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
        responseData.errors
        === 'object'
    ) {
      return Object
        .values(
          responseData.errors
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

function ServiceIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h10" />

      <circle
        cx="18"
        cy="17"
        r="2"
      />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 6h16M7 12h10M10 18h4" />
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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 7v5l3 2" />
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

export default ServicePage