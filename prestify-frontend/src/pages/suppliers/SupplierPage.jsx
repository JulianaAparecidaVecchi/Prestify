import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import authService
  from '../../services/authService'

import supplierService
  from '../../services/supplierService'

import './SupplierPage.css'

const MANAGE_ROLES = [
  'OWNER',
  'ADMIN',
  'MANAGER',
]

const EMPTY_FORM = {
  name: '',
  document: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
}

function SupplierPage() {
  const user = authService.getUser()

  const canManage =
    MANAGE_ROLES.includes(
      user?.role
    )

  const [
    suppliers,
    setSuppliers,
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
  ] = useState('ACTIVE')

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
    modalMode,
    setModalMode,
  ] = useState(null)

  const [
    selectedSupplier,
    setSelectedSupplier,
  ] = useState(null)

  const [
    form,
    setForm,
  ] = useState({
    ...EMPTY_FORM,
  })

  const [
    formError,
    setFormError,
  ] = useState('')

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    confirmation,
    setConfirmation,
  ] = useState(null)

  const [
    statusChanging,
    setStatusChanging,
  ] = useState(false)

  const [
    toast,
    setToast,
  ] = useState(null)

  const loadSuppliers =
    useCallback(
      async () => {
        try {
          setLoading(true)
          setError('')

          const response =
            await supplierService.list({
              search:
                appliedSearch,

              active:
                getActiveFilter(
                  statusFilter
                ),

              page,
              size: 20,
            })

          setSuppliers(
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
        } catch (err) {
          console.error(
            'Erro ao carregar fornecedores:',
            err
          )

          setError(
            getErrorMessage(err)
          )
        } finally {
          setLoading(false)
        }
      },
      [
        appliedSearch,
        statusFilter,
        page,
      ]
    )

  useEffect(() => {
    loadSuppliers()
  }, [loadSuppliers])

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
      clearTimeout(timer)
  }, [toast])

  const showToast = (
    message
  ) => {
    setToast({
      message,
    })
  }

  const handleSearchSubmit =
    (event) => {
      event.preventDefault()

      setPage(0)

      setAppliedSearch(
        search.trim()
      )
    }

  const clearSearch = () => {
    setSearch('')
    setAppliedSearch('')
    setPage(0)
  }

  const handleStatusFilter =
    (event) => {
      setStatusFilter(
        event.target.value
      )

      setPage(0)
    }

  const openCreateModal =
    () => {
      setSelectedSupplier(null)

      setForm({
        ...EMPTY_FORM,
      })

      setFormError('')
      setModalMode('create')
    }

  const openEditModal =
    (supplier) => {
      setSelectedSupplier(
        supplier
      )

      setForm(
        supplierToForm(
          supplier
        )
      )

      setFormError('')
      setModalMode('edit')
    }

  const openDetailsModal =
    async (supplier) => {
      try {
        setSelectedSupplier(
          supplier
        )

        setModalMode(
          'details'
        )

        const completeSupplier =
          await supplierService
            .getById(
              supplier.id
            )

        setSelectedSupplier(
          completeSupplier
        )
      } catch (err) {
        setModalMode(null)

        setError(
          getErrorMessage(err)
        )
      }
    }

  const closeModal = () => {
    if (saving) {
      return
    }

    setModalMode(null)
    setSelectedSupplier(null)

    setForm({
      ...EMPTY_FORM,
    })

    setFormError('')
  }

  const handleFormChange =
    (event) => {
      const {
        name,
        value,
      } = event.target

      let newValue = value

      if (
        name === 'document'
      ) {
        newValue =
          formatDocument(value)
      }

      if (
        name === 'phone'
      ) {
        newValue =
          formatPhone(value)
      }

      setForm(
        (current) => ({
          ...current,
          [name]: newValue,
        })
      )
    }

  const handleFormSubmit =
    async (event) => {
      event.preventDefault()

      const validation =
        validateSupplier(form)

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
          await supplierService
            .create(
              normalizeForm(form)
            )

          showToast(
            'Fornecedor cadastrado com sucesso.'
          )
        }

        if (
          modalMode
          === 'edit'
        ) {
          await supplierService
            .update(
              selectedSupplier.id,
              normalizeForm(form)
            )

          showToast(
            'Fornecedor atualizado com sucesso.'
          )
        }

        setModalMode(null)
        setSelectedSupplier(null)

        setForm({
          ...EMPTY_FORM,
        })

        await loadSuppliers()
      } catch (err) {
        console.error(
          'Erro ao salvar fornecedor:',
          err
        )

        setFormError(
          getErrorMessage(err)
        )
      } finally {
        setSaving(false)
      }
    }

  const askStatusChange =
    (supplier) => {
      const activating =
        !supplier.active

      setConfirmation({
        supplier,
        activating,

        title:
          activating
            ? 'Reativar fornecedor?'
            : 'Desativar fornecedor?',

        message:
          activating
            ? `O fornecedor "${supplier.name}" voltará a ficar ativo no sistema.`
            : `O fornecedor "${supplier.name}" ficará inativo, mas seu histórico continuará preservado.`,

        confirmText:
          activating
            ? 'Reativar'
            : 'Desativar',
      })
    }

  const confirmStatusChange =
    async () => {
      if (!confirmation) {
        return
      }

      try {
        setStatusChanging(true)

        const {
          supplier,
          activating,
        } = confirmation

        await supplierService
          .changeStatus(
            supplier.id,
            activating
          )

        setConfirmation(null)

        showToast(
          activating
            ? 'Fornecedor reativado com sucesso.'
            : 'Fornecedor desativado com sucesso.'
        )

        await loadSuppliers()
      } catch (err) {
        setConfirmation(null)

        setError(
          getErrorMessage(err)
        )
      } finally {
        setStatusChanging(false)
      }
    }

  const activeOnPage =
    suppliers.filter(
      (supplier) =>
        supplier.active
    ).length

  const inactiveOnPage =
    suppliers.filter(
      (supplier) =>
        !supplier.active
    ).length

  const withContactOnPage =
    suppliers.filter(
      (supplier) =>
        supplier.email
        || supplier.phone
    ).length

  return (
    <div className="supplier-page">
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

      <section className="supplier-header">
        <div>
          <span className="supplier-header-label">
            CADASTROS
          </span>

          <h1>
            Fornecedores
          </h1>

          <p>
            Organize fornecedores,
            contatos e informações
            comerciais do seu negócio.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            className="supplier-primary-button"
            onClick={
              openCreateModal
            }
          >
            <PlusIcon />

            Novo fornecedor
          </button>
        )}
      </section>

      <section className="supplier-summary-grid">
        <SummaryCard
          title="Fornecedores encontrados"
          value={
            totalElements
          }
          icon={
            <SupplierIcon />
          }
        />

        <SummaryCard
          title="Ativos nesta página"
          value={
            activeOnPage
          }
          icon={
            <CheckIcon />
          }
        />

        <SummaryCard
          title="Inativos nesta página"
          value={
            inactiveOnPage
          }
          icon={
            <PauseIcon />
          }
        />

        <SummaryCard
          title="Com contato nesta página"
          value={
            withContactOnPage
          }
          icon={
            <PhoneIcon />
          }
        />
      </section>

      <section className="supplier-content">
        <div className="supplier-toolbar">
          <form
            className="supplier-search"
            onSubmit={
              handleSearchSubmit
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
                  event.target.value
                )
              }
              placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone"
            />

            {search && (
              <button
                type="button"
                className="supplier-search-clear"
                onClick={
                  clearSearch
                }
              >
                ×
              </button>
            )}

            <button
              type="submit"
              className="supplier-search-button"
            >
              Buscar
            </button>
          </form>

          <select
            className="supplier-filter-select"
            value={
              statusFilter
            }
            onChange={
              handleStatusFilter
            }
          >
            <option value="ACTIVE">
              Fornecedores ativos
            </option>

            <option value="ALL">
              Todos os fornecedores
            </option>

            <option value="INACTIVE">
              Fornecedores inativos
            </option>
          </select>
        </div>

        {appliedSearch && (
          <div className="supplier-applied-filter">
            Resultados para:

            <strong>
              {' '}
              "{appliedSearch}"
            </strong>

            <button
              type="button"
              onClick={
                clearSearch
              }
            >
              Limpar
            </button>
          </div>
        )}

        {error && (
          <ErrorMessage
            message={error}
            onClose={() =>
              setError('')
            }
          />
        )}

        {loading ? (
          <Loading />
        ) : suppliers.length
          === 0 ? (
          <EmptyState
            canManage={
              canManage
            }
            onCreate={
              openCreateModal
            }
          />
        ) : (
          <>
            <div className="supplier-table-wrapper">
              <table className="supplier-table">
                <thead>
                  <tr>
                    <th>
                      Fornecedor
                    </th>

                    <th>
                      CPF/CNPJ
                    </th>

                    <th>
                      Contato
                    </th>

                    <th>
                      Endereço
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Atualizado em
                    </th>

                    <th className="supplier-actions-heading">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {suppliers.map(
                    (supplier) => (
                      <SupplierRow
                        key={
                          supplier.id
                        }
                        supplier={
                          supplier
                        }
                        canManage={
                          canManage
                        }
                        onView={() =>
                          openDetailsModal(
                            supplier
                          )
                        }
                        onEdit={() =>
                          openEditModal(
                            supplier
                          )
                        }
                        onStatus={() =>
                          askStatusChange(
                            supplier
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
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

      {modalMode === 'create'
        && (
        <SupplierFormModal
          title="Novo fornecedor"
          subtitle="Cadastre um novo fornecedor para sua organização."
          form={form}
          error={formError}
          saving={saving}
          onChange={
            handleFormChange
          }
          onSubmit={
            handleFormSubmit
          }
          onClose={
            closeModal
          }
          submitText="Cadastrar fornecedor"
        />
      )}

      {modalMode === 'edit'
        && (
        <SupplierFormModal
          title="Editar fornecedor"
          subtitle="Atualize as informações cadastrais do fornecedor."
          form={form}
          error={formError}
          saving={saving}
          onChange={
            handleFormChange
          }
          onSubmit={
            handleFormSubmit
          }
          onClose={
            closeModal
          }
          submitText="Salvar alterações"
        />
      )}

      {modalMode === 'details'
        && selectedSupplier && (
        <SupplierDetailsModal
          supplier={
            selectedSupplier
          }
          canManage={
            canManage
          }
          onClose={
            closeModal
          }
          onEdit={() => {
            setForm(
              supplierToForm(
                selectedSupplier
              )
            )

            setFormError('')
            setModalMode('edit')
          }}
        />
      )}

      {confirmation && (
        <ConfirmationModal
          title={
            confirmation.title
          }
          message={
            confirmation.message
          }
          confirmText={
            confirmation.confirmText
          }
          loading={
            statusChanging
          }
          danger={
            !confirmation
              .activating
          }
          onCancel={() =>
            setConfirmation(null)
          }
          onConfirm={
            confirmStatusChange
          }
        />
      )}
    </div>
  )
}

function SupplierRow({
  supplier,
  canManage,
  onView,
  onEdit,
  onStatus,
}) {
  return (
    <tr>
      <td>
        <div className="supplier-name-cell">
          <div className="supplier-avatar">
            {getInitials(
              supplier.name
            )}
          </div>

          <div>
            <strong>
              {supplier.name}
            </strong>

            <span>
              Fornecedor #{supplier.id}
            </span>
          </div>
        </div>
      </td>

      <td>
        {supplier.document
          ? (
            <span className="supplier-document">
              {formatDocument(
                supplier.document
              )}
            </span>
          )
          : (
            <span className="supplier-empty-value">
              Não informado
            </span>
          )}
      </td>

      <td>
        <div className="supplier-contact-cell">
          {supplier.email && (
            <span>
              <MailIcon />

              {supplier.email}
            </span>
          )}

          {supplier.phone && (
            <span>
              <PhoneIcon />

              {formatPhone(
                supplier.phone
              )}
            </span>
          )}

          {!supplier.email
            && !supplier.phone && (
            <span className="supplier-empty-value">
              Não informado
            </span>
          )}
        </div>
      </td>

      <td>
        <span className="supplier-address">
          {supplier.address
            || 'Não informado'}
        </span>
      </td>

      <td>
        <StatusBadge
          active={
            supplier.active
          }
        />
      </td>

      <td>
        {formatDateTime(
          supplier.updatedAt
        )}
      </td>

      <td>
        <div className="supplier-row-actions">
          <button
            type="button"
            title="Visualizar"
            onClick={
              onView
            }
          >
            <EyeIcon />
          </button>

          {canManage && (
            <>
              <button
                type="button"
                title="Editar"
                onClick={
                  onEdit
                }
              >
                <EditIcon />
              </button>

              <button
                type="button"
                className={
                  supplier.active
                    ? 'supplier-action-danger'
                    : 'supplier-action-success'
                }
                title={
                  supplier.active
                    ? 'Desativar'
                    : 'Reativar'
                }
                onClick={
                  onStatus
                }
              >
                {supplier.active
                  ? <PauseIcon />
                  : <PlayIcon />}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

function SupplierFormModal({
  title,
  subtitle,
  form,
  error,
  saving,
  onChange,
  onSubmit,
  onClose,
  submitText,
}) {
  return (
    <div
      className="supplier-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="supplier-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="supplier-modal-header">
          <div>
            <span>
              FORNECEDORES
            </span>

            <h2>
              {title}
            </h2>

            <p>
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            className="supplier-modal-close"
            disabled={
              saving
            }
            onClick={
              onClose
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
          <div className="supplier-modal-body">
            <div className="supplier-form-grid">
              <FormGroup
                label="Nome do fornecedor *"
                name="name"
                value={
                  form.name
                }
                maxLength={150}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="Ex.: Distribuidora Central"
                full
              />

              <FormGroup
                label="CPF/CNPJ"
                name="document"
                value={
                  form.document
                }
                maxLength={18}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="00.000.000/0000-00"
              />

              <FormGroup
                label="Telefone"
                name="phone"
                value={
                  form.phone
                }
                maxLength={15}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="(41) 99999-9999"
              />

              <FormGroup
                label="E-mail"
                name="email"
                type="email"
                value={
                  form.email
                }
                maxLength={150}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="contato@empresa.com"
                full
              />

              <FormGroup
                label="Endereço"
                name="address"
                value={
                  form.address
                }
                maxLength={250}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="Rua, número, bairro, cidade..."
                full
              />
            </div>

            <div className="supplier-form-group">
              <label htmlFor="supplier-notes">
                Observações
              </label>

              <textarea
                id="supplier-notes"
                name="notes"
                rows="5"
                maxLength="2000"
                value={
                  form.notes
                }
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="Informações adicionais sobre o fornecedor..."
              />

              <span className="supplier-character-count">
                {form.notes.length}
                /2000
              </span>
            </div>

            {error && (
              <div className="supplier-form-error">
                <WarningIcon />

                <span>
                  {error}
                </span>
              </div>
            )}
          </div>

          <div className="supplier-modal-footer">
            <button
              type="button"
              className="supplier-secondary-button"
              disabled={
                saving
              }
              onClick={
                onClose
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="supplier-primary-button"
              disabled={
                saving
              }
            >
              {saving
                ? 'Salvando...'
                : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormGroup({
  label,
  name,
  value,
  type = 'text',
  maxLength,
  disabled,
  onChange,
  placeholder,
  full = false,
}) {
  return (
    <div
      className={
        full
          ? 'supplier-form-group supplier-form-full'
          : 'supplier-form-group'
      }
    >
      <label
        htmlFor={
          `supplier-${name}`
        }
      >
        {label}
      </label>

      <input
        id={
          `supplier-${name}`
        }
        type={type}
        name={name}
        value={value}
        maxLength={
          maxLength
        }
        disabled={
          disabled
        }
        onChange={
          onChange
        }
        placeholder={
          placeholder
        }
      />
    </div>
  )
}

function SupplierDetailsModal({
  supplier,
  canManage,
  onClose,
  onEdit,
}) {
  return (
    <div
      className="supplier-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="supplier-modal supplier-details-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="supplier-modal-header">
          <div>
            <span>
              FORNECEDOR
            </span>

            <h2>
              Detalhes do fornecedor
            </h2>

            <p>
              Informações cadastrais
              e de contato.
            </p>
          </div>

          <button
            type="button"
            className="supplier-modal-close"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </div>

        <div className="supplier-details-body">
          <div className="supplier-details-main">
            <div className="supplier-details-avatar">
              {getInitials(
                supplier.name
              )}
            </div>

            <div>
              <h3>
                {supplier.name}
              </h3>

              <span>
                Fornecedor #{supplier.id}
              </span>
            </div>

            <StatusBadge
              active={
                supplier.active
              }
            />
          </div>

          <div className="supplier-details-grid">
            <DetailItem
              label="CPF/CNPJ"
              value={
                supplier.document
                  ? formatDocument(
                      supplier.document
                    )
                  : 'Não informado'
              }
            />

            <DetailItem
              label="Telefone"
              value={
                supplier.phone
                  ? formatPhone(
                      supplier.phone
                    )
                  : 'Não informado'
              }
            />

            <DetailItem
              label="E-mail"
              value={
                supplier.email
                || 'Não informado'
              }
            />

            <DetailItem
              label="Endereço"
              value={
                supplier.address
                || 'Não informado'
              }
            />

            <DetailItem
              label="Cadastrado em"
              value={
                formatDateTime(
                  supplier.createdAt
                )
              }
            />

            <DetailItem
              label="Atualizado em"
              value={
                formatDateTime(
                  supplier.updatedAt
                )
              }
            />
          </div>

          <div className="supplier-details-notes">
            <span>
              Observações
            </span>

            <p>
              {supplier.notes
                || 'Nenhuma observação informada.'}
            </p>
          </div>
        </div>

        <div className="supplier-modal-footer">
          <button
            type="button"
            className="supplier-secondary-button"
            onClick={
              onClose
            }
          >
            Fechar
          </button>

          {canManage && (
            <button
              type="button"
              className="supplier-primary-button"
              onClick={
                onEdit
              }
            >
              <EditIcon />

              Editar fornecedor
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmationModal({
  title,
  message,
  confirmText,
  loading,
  danger,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="supplier-modal-overlay supplier-confirmation-overlay"
      onMouseDown={
        onCancel
      }
    >
      <div
        className="supplier-confirmation-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div
          className={
            danger
              ? 'supplier-confirmation-icon supplier-confirmation-danger'
              : 'supplier-confirmation-icon supplier-confirmation-success'
          }
        >
          {danger
            ? <PauseIcon />
            : <PlayIcon />}
        </div>

        <h3>
          {title}
        </h3>

        <p>
          {message}
        </p>

        <div className="supplier-confirmation-actions">
          <button
            type="button"
            className="supplier-secondary-button"
            disabled={
              loading
            }
            onClick={
              onCancel
            }
          >
            Cancelar
          </button>

          <button
            type="button"
            className={
              danger
                ? 'supplier-danger-button'
                : 'supplier-primary-button'
            }
            disabled={
              loading
            }
            onClick={
              onConfirm
            }
          >
            {loading
              ? 'Aguarde...'
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="supplier-summary-card">
      <div className="supplier-summary-icon">
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

function StatusBadge({
  active,
}) {
  return (
    <span
      className={
        active
          ? 'supplier-status supplier-status-active'
          : 'supplier-status supplier-status-inactive'
      }
    >
      <span />

      {active
        ? 'Ativo'
        : 'Inativo'}
    </span>
  )
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="supplier-detail-item">
      <span>
        {label}
      </span>

      <strong>
        {value}
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
  return (
    <div className="supplier-pagination">
      <span>
        {totalElements}
        {' '}
        {totalElements === 1
          ? 'fornecedor'
          : 'fornecedores'}
      </span>

      {totalPages > 1 && (
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

          <span>
            {page + 1}
            {' / '}
            {totalPages}
          </span>

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
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className="supplier-loading">
      <div className="supplier-spinner" />

      <span>
        Carregando fornecedores...
      </span>
    </div>
  )
}

function EmptyState({
  canManage,
  onCreate,
}) {
  return (
    <div className="supplier-empty">
      <div className="supplier-empty-icon">
        <SupplierIcon />
      </div>

      <strong>
        Nenhum fornecedor encontrado
      </strong>

      <p>
        Nenhum fornecedor corresponde
        aos filtros selecionados.
      </p>

      {canManage && (
        <button
          type="button"
          className="supplier-primary-button"
          onClick={
            onCreate
          }
        >
          <PlusIcon />

          Novo fornecedor
        </button>
      )}
    </div>
  )
}

function ErrorMessage({
  message,
  onClose,
}) {
  return (
    <div className="supplier-error-message">
      <WarningIcon />

      <span>
        {message}
      </span>

      <button
        type="button"
        onClick={
          onClose
        }
      >
        ×
      </button>
    </div>
  )
}

function SuccessToast({
  message,
  onClose,
}) {
  return (
    <div className="supplier-toast">
      <div className="supplier-toast-icon">
        <CheckIcon />
      </div>

      <div className="supplier-toast-content">
        <strong>
          Operação concluída
        </strong>

        <span>
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={
          onClose
        }
      >
        ×
      </button>

      <div className="supplier-toast-progress" />
    </div>
  )
}

function validateSupplier(
  form
) {
  const name =
    form.name.trim()

  if (!name) {
    return 'O nome do fornecedor é obrigatório.'
  }

  if (
    name.length > 150
  ) {
    return 'O nome deve possuir no máximo 150 caracteres.'
  }

  const document =
    onlyDigits(
      form.document
    )

  if (
    form.document.trim()
    && ![
      11,
      14,
    ].includes(
      document.length
    )
  ) {
    return 'Informe um CPF com 11 dígitos ou CNPJ com 14 dígitos.'
  }

  if (
    form.email.trim()
    && !isValidEmail(
      form.email
    )
  ) {
    return 'Informe um e-mail válido.'
  }

  if (
    form.email.trim()
      .length > 150
  ) {
    return 'O e-mail deve possuir no máximo 150 caracteres.'
  }

  if (
    form.address.trim()
      .length > 250
  ) {
    return 'O endereço deve possuir no máximo 250 caracteres.'
  }

  if (
    form.notes.length > 2000
  ) {
    return 'As observações devem possuir no máximo 2000 caracteres.'
  }

  return ''
}

function normalizeForm(
  form
) {
  return {
    name:
      form.name.trim(),

    document:
      form.document.trim()
      || '',

    email:
      form.email.trim()
      || '',

    phone:
      form.phone.trim()
      || '',

    address:
      form.address.trim()
      || '',

    notes:
      form.notes.trim()
      || '',
  }
}

function supplierToForm(
  supplier
) {
  return {
    name:
      supplier.name
      || '',

    document:
      formatDocument(
        supplier.document
        || ''
      ),

    email:
      supplier.email
      || '',

    phone:
      formatPhone(
        supplier.phone
        || ''
      ),

    address:
      supplier.address
      || '',

    notes:
      supplier.notes
      || '',
  }
}

function getActiveFilter(
  value
) {
  if (
    value === 'ACTIVE'
  ) {
    return true
  }

  if (
    value === 'INACTIVE'
  ) {
    return false
  }

  return null
}

function onlyDigits(
  value
) {
  return String(
    value || ''
  ).replace(
    /\D/g,
    ''
  )
}

function formatDocument(
  value
) {
  const digits =
    onlyDigits(value)
      .slice(0, 14)

  if (
    digits.length <= 11
  ) {
    return digits
      .replace(
        /^(\d{3})(\d)/,
        '$1.$2'
      )
      .replace(
        /^(\d{3})\.(\d{3})(\d)/,
        '$1.$2.$3'
      )
      .replace(
        /\.(\d{3})(\d)/,
        '.$1-$2'
      )
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

function formatPhone(
  value
) {
  const digits =
    onlyDigits(value)
      .slice(0, 11)

  if (
    digits.length <= 10
  ) {
    return digits
      .replace(
        /^(\d{2})(\d)/,
        '($1) $2'
      )
      .replace(
        /(\d{4})(\d)/,
        '$1-$2'
      )
  }

  return digits
    .replace(
      /^(\d{2})(\d)/,
      '($1) $2'
    )
    .replace(
      /(\d{5})(\d)/,
      '$1-$2'
    )
}

function isValidEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      value.trim()
    )
}

function getInitials(
  name
) {
  if (!name) {
    return 'F'
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
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    parts[0][0]
    + parts[
      parts.length - 1
    ][0]
  ).toUpperCase()
}

function formatDateTime(
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
    return value
  }

  return new Intl
    .DateTimeFormat(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short',
      }
    )
    .format(date)
}

function getErrorMessage(
  error
) {
  const data =
    error.response?.data

  if (data?.message) {
    return data.message
  }

  if (data?.errors) {
    if (
      Array.isArray(
        data.errors
      )
    ) {
      return data.errors
        .map(
          (item) =>
            item.message
            || item.defaultMessage
            || item
        )
        .join(' ')
    }

    if (
      typeof data.errors
      === 'object'
    ) {
      return Object
        .values(
          data.errors
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

function SupplierIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 21V8l6-4 6 4v13" />
      <path d="M15 11h6v10" />
      <path d="M7 11h4M7 15h4M7 19h4" />
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
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

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M9 6v12M15 6v12" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m8 5 11 7-11 7V5Z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 4h4l2 5-3 2a16 16 0 0 0 5 5l2-3 5 2v4c0 1-1 2-2 2C9 21 3 15 3 6c0-1 1-2 2-2Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m3 7 9 6 9-6" />
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
      <path d="m4 20 4-1 10-10-3-3L5 16l-1 4Z" />
      <path d="m14 7 3 3" />
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

export default SupplierPage