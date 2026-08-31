import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import authService
  from '../../services/authService'

import productService
  from '../../services/productService'

import './ProductPage.css'

const EMPTY_FORM = {
  name: '',
  sku: '',
  description: '',
  salePrice: '',
  costPrice: '',
  unit: 'UN',
  minimumStock: '0',
}

const MANAGE_ROLES = [
  'OWNER',
  'ADMIN',
  'MANAGER',
]

const UNIT_OPTIONS = [
  'UN',
  'CX',
  'PCT',
  'KG',
  'G',
  'L',
  'ML',
  'M',
  'M²',
  'M³',
  'PAR',
  'KIT',
]

function ProductPage() {
  const user =
    authService.getUser()

  const role =
    user?.role || ''

  const canManage =
    MANAGE_ROLES.includes(
      role
    )

  const [
    products,
    setProducts,
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
    selectedProduct,
    setSelectedProduct,
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
    detailsProduct,
    setDetailsProduct,
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

  const loadProducts =
    useCallback(
      async () => {
        try {
          setLoading(true)
          setError('')

          const response =
            await productService.list({
              search:
                appliedSearch,

              active:
                getActiveFilter(
                  statusFilter
                ),

              page,
              size: 20,
            })

          setProducts(
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
            'Erro ao carregar produtos:',
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
    loadProducts()
  }, [loadProducts])

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

      setSelectedProduct(
        null
      )

      setForm({
        ...EMPTY_FORM,
      })

      setFormError('')
      setModalOpen(true)
    }

  const openEditModal =
    (product) => {
      setModalMode(
        'edit'
      )

      setSelectedProduct(
        product
      )

      setForm({
        name:
          product.name
          || '',

        sku:
          product.sku
          || '',

        description:
          product.description
          || '',

        salePrice:
          product.salePrice
          ?? '',

        costPrice:
          product.costPrice
          ?? '',

        unit:
          product.unit
          || 'UN',

        minimumStock:
          product.minimumStock
          ?? '0',
      })

      setFormError('')
      setModalOpen(true)
    }

  const closeModal =
    () => {
      if (saving) {
        return
      }

      setModalOpen(false)

      setSelectedProduct(
        null
      )

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

      let newValue =
        value

      if (
        name
        === 'minimumStock'
      ) {
        newValue =
          value.replace(
            /\D/g,
            ''
          )
      }

      if (
        name
        === 'salePrice'
        ||
        name
        === 'costPrice'
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
          await productService
            .create(
              form
            )

          showToast(
            'Produto cadastrado com sucesso.'
          )
        } else {
          await productService
            .update(
              selectedProduct.id,
              form
            )

          showToast(
            'Produto atualizado com sucesso.'
          )
        }

        setModalOpen(false)

        setSelectedProduct(
          null
        )

        setForm({
          ...EMPTY_FORM,
        })

        await loadProducts()
      } catch (
        requestError
      ) {
        console.error(
          'Erro ao salvar produto:',
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
    async (product) => {
      try {
        setActionLoading(
          product.id
        )

        const response =
          await productService
            .getById(
              product.id
            )

        setDetailsProduct(
          response
        )

        setDetailsOpen(true)
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
    (product) => {
      setConfirmModal({
        type:
          product.active
            ? 'deactivate'
            : 'activate',

        product,
      })
    }

  const executeStatusChange =
    async () => {
      if (
        !confirmModal
          ?.product
      ) {
        return
      }

      const product =
        confirmModal.product

      const newStatus =
        confirmModal.type
        === 'activate'

      try {
        setActionLoading(
          product.id
        )

        await productService
          .changeStatus(
            product.id,
            newStatus
          )

        showToast(
          newStatus
            ? 'Produto reativado com sucesso.'
            : 'Produto desativado com sucesso.'
        )

        setConfirmModal(
          null
        )

        await loadProducts()
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
    <div className="product-page">
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

      <section className="product-header">
        <div>
          <span className="product-header-label">
            CATÁLOGO
          </span>

          <h1>
            Produtos
          </h1>

          <p>
            Gerencie os produtos,
            preços e parâmetros
            utilizados pelo estoque.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            className="product-primary-button"
            onClick={
              openCreateModal
            }
          >
            <PlusIcon />

            Novo produto
          </button>
        )}
      </section>

      {error && (
        <div className="product-message product-message-error">
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

      <section className="product-summary-grid">
        <SummaryCard
          title="Produtos encontrados"
          value={
            totalElements
          }
          icon={
            <ProductIcon />
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

      <section className="product-content">
        <div className="product-toolbar">
          <form
            className="product-search"
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
              placeholder="Buscar por nome, SKU ou descrição"
            />

            {search && (
              <button
                type="button"
                className="product-search-clear"
                onClick={
                  handleClearSearch
                }
              >
                ×
              </button>
            )}

            <button
              type="submit"
              className="product-search-button"
            >
              Buscar
            </button>
          </form>

          <select
            className="product-status-filter"
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
          <div className="product-applied-filter">
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
          <ProductLoading />
        ) : products.length
          === 0 ? (
          <ProductEmpty
            canManage={
              canManage
            }
            onCreate={
              openCreateModal
            }
          />
        ) : (
          <>
            <div className="product-table-wrapper">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>
                      Produto
                    </th>

                    <th>
                      SKU
                    </th>

                    <th>
                      Custo
                    </th>

                    <th>
                      Venda
                    </th>

                    <th>
                      Unidade
                    </th>

                    <th>
                      Estoque mín.
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="product-actions-heading">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(
                    (product) => (
                      <ProductRow
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                        canManage={
                          canManage
                        }
                        loading={
                          actionLoading
                          === product.id
                        }
                        onDetails={() =>
                          openDetails(
                            product
                          )
                        }
                        onEdit={() =>
                          openEditModal(
                            product
                          )
                        }
                        onStatus={() =>
                          requestStatusChange(
                            product
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
        <ProductModal
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
        && detailsProduct && (
        <ProductDetailsModal
          product={
            detailsProduct
          }
          canManage={
            canManage
          }
          onClose={() => {
            setDetailsOpen(
              false
            )

            setDetailsProduct(
              null
            )
          }}
          onEdit={() => {
            setDetailsOpen(
              false
            )

            openEditModal(
              detailsProduct
            )
          }}
        />
      )}

      {confirmModal && (
        <ConfirmationModal
          type={
            confirmModal.type
          }
          product={
            confirmModal.product
          }
          loading={
            actionLoading
            ===
            confirmModal
              .product
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
    <div className="product-summary-card">
      <div className="product-summary-icon">
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

function ProductRow({
  product,
  canManage,
  loading,
  onDetails,
  onEdit,
  onStatus,
}) {
  return (
    <tr>
      <td>
        <div className="product-main-cell">
          <div className="product-icon-box">
            <ProductIcon />
          </div>

          <div>
            <strong>
              {product.name}
            </strong>

            <span>
              {product.description
                || 'Sem descrição'}
            </span>
          </div>
        </div>
      </td>

      <td>
        <span className="product-sku">
          {product.sku}
        </span>
      </td>

      <td>
        {formatCurrency(
          product.costPrice
        )}
      </td>

      <td>
        <strong className="product-sale-price">
          {formatCurrency(
            product.salePrice
          )}
        </strong>
      </td>

      <td>
        {product.unit}
      </td>

      <td>
        {product.minimumStock}
      </td>

      <td>
        <span
          className={`product-status ${
            product.active
              ? 'product-status-active'
              : 'product-status-inactive'
          }`}
        >
          <span />

          {product.active
            ? 'Ativo'
            : 'Inativo'}
        </span>
      </td>

      <td>
        <div className="product-row-actions">
          <button
            type="button"
            title="Visualizar produto"
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
                title="Editar produto"
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
                  product.active
                    ? 'Desativar produto'
                    : 'Reativar produto'
                }
                disabled={
                  loading
                }
                onClick={
                  onStatus
                }
              >
                {product.active
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

function ProductModal({
  mode,
  form,
  error,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  const financial =
    calculateFinancialData(
      form.costPrice,
      form.salePrice
    )

  return (
    <div
      className="product-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="product-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="product-modal-header">
          <div>
            <span>
              {mode === 'create'
                ? 'CADASTRO'
                : 'EDIÇÃO'}
            </span>

            <h2>
              {mode === 'create'
                ? 'Novo produto'
                : 'Editar produto'}
            </h2>

            <p>
              Informe os dados
              comerciais e de estoque
              do produto.
            </p>
          </div>

          <button
            type="button"
            className="product-modal-close"
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
          <div className="product-form-grid">
            <div className="product-form-group">
              <label htmlFor="product-name">
                Nome *
              </label>

              <input
                id="product-name"
                type="text"
                name="name"
                maxLength="150"
                value={
                  form.name
                }
                onChange={
                  onChange
                }
                placeholder="Ex.: Shampoo profissional"
              />
            </div>

            <div className="product-form-group">
              <label htmlFor="product-sku">
                SKU *
              </label>

              <input
                id="product-sku"
                type="text"
                name="sku"
                maxLength="50"
                value={
                  form.sku
                }
                onChange={
                  onChange
                }
                placeholder="Ex.: SHAMP-001"
              />
            </div>

            <div className="product-form-group">
              <label htmlFor="product-cost-price">
                Preço de custo *
              </label>

              <div className="product-price-input">
                <span>
                  R$
                </span>

                <input
                  id="product-cost-price"
                  type="text"
                  name="costPrice"
                  inputMode="decimal"
                  value={
                    form.costPrice
                  }
                  onChange={
                    onChange
                  }
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="product-form-group">
              <label htmlFor="product-sale-price">
                Preço de venda *
              </label>

              <div className="product-price-input">
                <span>
                  R$
                </span>

                <input
                  id="product-sale-price"
                  type="text"
                  name="salePrice"
                  inputMode="decimal"
                  value={
                    form.salePrice
                  }
                  onChange={
                    onChange
                  }
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="product-financial-preview product-form-full">
              <FinancialItem
                label="Custo"
                value={
                  financial.cost
                }
              />

              <FinancialItem
                label="Venda"
                value={
                  financial.sale
                }
              />

              <FinancialItem
                label="Lucro unitário"
                value={
                  financial.profit
                }
                highlight
              />

              <FinancialItem
                label="Margem"
                value={
                  financial.margin
                }
                highlight
              />
            </div>

            <div className="product-form-group">
              <label htmlFor="product-unit">
                Unidade *
              </label>

              <input
                id="product-unit"
                type="text"
                name="unit"
                list="product-unit-options"
                maxLength="30"
                value={
                  form.unit
                }
                onChange={
                  onChange
                }
                placeholder="Ex.: UN"
              />

              <datalist id="product-unit-options">
                {UNIT_OPTIONS.map(
                  (unit) => (
                    <option
                      key={
                        unit
                      }
                      value={
                        unit
                      }
                    />
                  )
                )}
              </datalist>
            </div>

            <div className="product-form-group">
              <label htmlFor="product-minimum-stock">
                Estoque mínimo *
              </label>

              <input
                id="product-minimum-stock"
                type="text"
                name="minimumStock"
                inputMode="numeric"
                value={
                  form.minimumStock
                }
                onChange={
                  onChange
                }
                placeholder="0"
              />

              <small>
                Quantidade mínima para
                alerta de estoque baixo.
              </small>
            </div>

            <div className="product-form-group product-form-full">
              <label htmlFor="product-description">
                Descrição
              </label>

              <textarea
                id="product-description"
                name="description"
                rows="5"
                maxLength="2000"
                value={
                  form.description
                }
                onChange={
                  onChange
                }
                placeholder="Descreva o produto..."
              />

              <span className="product-character-count">
                {form.description.length}
                /2000
              </span>
            </div>
          </div>

          {error && (
            <div className="product-form-error">
              <WarningIcon />

              <span>
                {error}
              </span>
            </div>
          )}

          <div className="product-modal-footer">
            <button
              type="button"
              className="product-secondary-button"
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
              className="product-primary-button"
              disabled={
                saving
              }
            >
              {saving
                ? 'Salvando...'
                : mode
                  === 'create'
                  ? 'Cadastrar produto'
                  : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FinancialItem({
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      className={
        highlight
          ? 'product-financial-item product-financial-highlight'
          : 'product-financial-item'
      }
    >
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  )
}

function ProductDetailsModal({
  product,
  canManage,
  onClose,
  onEdit,
}) {
  const financial =
    calculateFinancialData(
      product.costPrice,
      product.salePrice
    )

  return (
    <div
      className="product-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="product-modal product-details-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="product-modal-header">
          <div>
            <span>
              DETALHES
            </span>

            <h2>
              {product.name}
            </h2>

            <p>
              Informações cadastradas
              do produto.
            </p>
          </div>

          <button
            type="button"
            className="product-modal-close"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </div>

        <div className="product-details-hero">
          <div className="product-details-icon">
            <ProductIcon />
          </div>

          <div>
            <strong>
              {product.name}
            </strong>

            <small>
              SKU:
              {' '}
              {product.sku}
            </small>

            <span
              className={`product-status ${
                product.active
                  ? 'product-status-active'
                  : 'product-status-inactive'
              }`}
            >
              <span />

              {product.active
                ? 'Ativo'
                : 'Inativo'}
            </span>
          </div>
        </div>

        <div className="product-details-grid">
          <DetailItem
            label="Preço de custo"
            value={
              formatCurrency(
                product.costPrice
              )
            }
          />

          <DetailItem
            label="Preço de venda"
            value={
              formatCurrency(
                product.salePrice
              )
            }
          />

          <DetailItem
            label="Lucro unitário"
            value={
              financial.profit
            }
          />

          <DetailItem
            label="Margem sobre venda"
            value={
              financial.margin
            }
          />

          <DetailItem
            label="Unidade"
            value={
              product.unit
            }
          />

          <DetailItem
            label="Estoque mínimo"
            value={
              String(
                product.minimumStock
              )
            }
          />

          <DetailItem
            label="Cadastrado em"
            value={
              formatDateTime(
                product.createdAt
              )
            }
          />

          <DetailItem
            label="Última atualização"
            value={
              formatDateTime(
                product.updatedAt
              )
            }
          />
        </div>

        <div className="product-details-description">
          <span>
            Descrição
          </span>

          <p>
            {product.description
              || 'Nenhuma descrição cadastrada.'}
          </p>
        </div>

        <div className="product-stock-information">
          <InfoIcon />

          <div>
            <strong>
              Controle de estoque
            </strong>

            <p>
              A quantidade atual deste
              produto é administrada no
              módulo Estoque. Aqui é
              definido apenas o estoque
              mínimo.
            </p>
          </div>
        </div>

        <div className="product-modal-footer">
          <button
            type="button"
            className="product-secondary-button"
            onClick={
              onClose
            }
          >
            Fechar
          </button>

          {canManage && (
            <button
              type="button"
              className="product-primary-button"
              onClick={
                onEdit
              }
            >
              <EditIcon />

              Editar produto
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
    <div className="product-detail-item">
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

function ConfirmationModal({
  type,
  product,
  loading,
  onConfirm,
  onClose,
}) {
  const isActivate =
    type === 'activate'

  return (
    <div
      className="product-modal-overlay"
      onMouseDown={
        loading
          ? undefined
          : onClose
      }
    >
      <div
        className="product-confirm-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div
          className={`product-confirm-icon ${
            isActivate
              ? 'product-confirm-icon-success'
              : 'product-confirm-icon-warning'
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

        <div className="product-confirm-content">
          <h2>
            {isActivate
              ? 'Reativar produto?'
              : 'Desativar produto?'}
          </h2>

          <p>
            {isActivate
              ? `O produto "${product.name}" voltará a ficar disponível no sistema.`
              : `O produto "${product.name}" ficará inativo. O histórico de estoque será preservado.`}
          </p>
        </div>

        <div className="product-confirm-footer">
          <button
            type="button"
            className="product-secondary-button"
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
                ? 'product-success-button'
                : 'product-warning-button'
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
                ? 'Reativar produto'
                : 'Desativar produto'}
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
    <div className="product-toast">
      <div className="product-toast-icon">
        <CheckIcon />
      </div>

      <div className="product-toast-content">
        <strong>
          Operação concluída
        </strong>

        <span>
          {message}
        </span>
      </div>

      <button
        type="button"
        className="product-toast-close"
        onClick={
          onClose
        }
      >
        ×
      </button>

      <div className="product-toast-progress" />
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
      <div className="product-pagination product-pagination-single">
        <span>
          {totalElements}
          {' '}
          {totalElements
            === 1
            ? 'produto'
            : 'produtos'}
        </span>
      </div>
    )
  }

  return (
    <div className="product-pagination">
      <span>
        Página
        {' '}
        {page + 1}
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

function ProductLoading() {
  return (
    <div className="product-loading">
      <div className="product-spinner" />

      <span>
        Carregando produtos...
      </span>
    </div>
  )
}

function ProductEmpty({
  canManage,
  onCreate,
}) {
  return (
    <div className="product-empty">
      <div className="product-empty-icon">
        <ProductIcon />
      </div>

      <strong>
        Nenhum produto encontrado
      </strong>

      <p>
        Cadastre um produto ou
        altere os filtros utilizados.
      </p>

      {canManage && (
        <button
          type="button"
          className="product-primary-button"
          onClick={
            onCreate
          }
        >
          <PlusIcon />

          Novo produto
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

  const sku =
    form.sku.trim()

  const unit =
    form.unit.trim()

  const description =
    form.description.trim()

  if (!name) {
    return 'Informe o nome do produto.'
  }

  if (
    name.length > 150
  ) {
    return 'O nome deve possuir no máximo 150 caracteres.'
  }

  if (!sku) {
    return 'Informe o SKU do produto.'
  }

  if (
    sku.length > 50
  ) {
    return 'O SKU deve possuir no máximo 50 caracteres.'
  }

  if (
    description.length
    > 2000
  ) {
    return 'A descrição deve possuir no máximo 2000 caracteres.'
  }

  if (
    form.costPrice === ''
    ||
    form.costPrice === null
  ) {
    return 'Informe o preço de custo.'
  }

  const costPrice =
    Number(
      form.costPrice
    )

  if (
    !Number.isFinite(
      costPrice
    )
  ) {
    return 'Informe um preço de custo válido.'
  }

  if (
    costPrice < 0
  ) {
    return 'O preço de custo não pode ser negativo.'
  }

  if (
    costPrice
    > 9999999999.99
  ) {
    return 'O preço de custo ultrapassa o limite permitido.'
  }

  if (
    form.salePrice === ''
    ||
    form.salePrice === null
  ) {
    return 'Informe o preço de venda.'
  }

  const salePrice =
    Number(
      form.salePrice
    )

  if (
    !Number.isFinite(
      salePrice
    )
  ) {
    return 'Informe um preço de venda válido.'
  }

  if (
    salePrice < 0
  ) {
    return 'O preço de venda não pode ser negativo.'
  }

  if (
    salePrice
    > 9999999999.99
  ) {
    return 'O preço de venda ultrapassa o limite permitido.'
  }

  if (!unit) {
    return 'Informe a unidade do produto.'
  }

  if (
    unit.length > 30
  ) {
    return 'A unidade deve possuir no máximo 30 caracteres.'
  }

  if (
    form.minimumStock === ''
  ) {
    return 'Informe o estoque mínimo.'
  }

  const minimumStock =
    Number(
      form.minimumStock
    )

  if (
    !Number.isInteger(
      minimumStock
    )
  ) {
    return 'O estoque mínimo deve ser um número inteiro.'
  }

  if (
    minimumStock < 0
  ) {
    return 'O estoque mínimo não pode ser negativo.'
  }

  if (
    minimumStock
    > 2147483647
  ) {
    return 'O estoque mínimo ultrapassa o limite permitido.'
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
    normalized
      .indexOf('.')

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

  const decimalIndex =
    normalized.indexOf('.')

  const integerPart =
    decimalIndex === -1
      ? normalized
      : normalized.slice(
          0,
          decimalIndex
        )

  if (
    integerPart.length > 10
  ) {
    const decimalPart =
      decimalIndex === -1
        ? ''
        : normalized.slice(
            decimalIndex
          )

    normalized =
      integerPart.slice(
        0,
        10
      )
      + decimalPart
  }

  return normalized
}

function calculateFinancialData(
  costValue,
  saleValue
) {
  const cost =
    Number(
      costValue
    )

  const sale =
    Number(
      saleValue
    )

  const validCost =
    Number.isFinite(cost)
      ? cost
      : 0

  const validSale =
    Number.isFinite(sale)
      ? sale
      : 0

  const profit =
    validSale
    - validCost

  const margin =
    validSale > 0
      ? (
          profit
          / validSale
        ) * 100
      : 0

  return {
    cost:
      formatCurrency(
        validCost
      ),

    sale:
      formatCurrency(
        validSale
      ),

    profit:
      formatCurrency(
        profit
      ),

    margin:
      `${margin.toLocaleString(
        'pt-BR',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}%`,
  }
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
    !Number.isFinite(
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

function ProductIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m4 8 8-4 8 4-8 4-8-4Z" />

      <path d="M4 8v8l8 4 8-4V8" />

      <path d="M12 12v8" />
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

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 11v5M12 8h.01" />
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

export default ProductPage