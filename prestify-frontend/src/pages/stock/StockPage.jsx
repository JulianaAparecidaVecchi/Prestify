import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import authService
  from '../../services/authService'

import productService
  from '../../services/productService'

import stockService
  from '../../services/stockService'

import './StockPage.css'

const MANAGE_ROLES = [
  'OWNER',
  'ADMIN',
  'MANAGER',
]

const MOVEMENT_TYPES = {
  ENTRY: {
    label: 'Entrada',
    shortLabel: 'Entrada',
  },

  EXIT: {
    label: 'Saída',
    shortLabel: 'Saída',
  },

  ADJUSTMENT: {
    label: 'Ajuste de saldo',
    shortLabel: 'Ajuste',
  },
}

const EMPTY_MOVEMENT_FORM = {
  productId: '',
  type: 'ENTRY',
  quantity: '',
  reason: '',
}

function StockPage() {
  const user =
    authService.getUser()

  const role =
    user?.role || ''

  const canManage =
    MANAGE_ROLES.includes(
      role
    )

  const [
    activeTab,
    setActiveTab,
  ] = useState('stock')

  const [
    stocks,
    setStocks,
  ] = useState([])

  const [
    stockLoading,
    setStockLoading,
  ] = useState(true)

  const [
    stockError,
    setStockError,
  ] = useState('')

  const [
    stockSearch,
    setStockSearch,
  ] = useState('')

  const [
    appliedStockSearch,
    setAppliedStockSearch,
  ] = useState('')

  const [
    stockStatus,
    setStockStatus,
  ] = useState('ACTIVE')

  const [
    stockPage,
    setStockPage,
  ] = useState(0)

  const [
    stockTotalPages,
    setStockTotalPages,
  ] = useState(0)

  const [
    stockTotalElements,
    setStockTotalElements,
  ] = useState(0)

  const [
    movements,
    setMovements,
  ] = useState([])

  const [
    movementsLoading,
    setMovementsLoading,
  ] = useState(false)

  const [
    movementsError,
    setMovementsError,
  ] = useState('')

  const [
    movementPage,
    setMovementPage,
  ] = useState(0)

  const [
    movementTotalPages,
    setMovementTotalPages,
  ] = useState(0)

  const [
    movementTotalElements,
    setMovementTotalElements,
  ] = useState(0)

  const [
    movementProductFilter,
    setMovementProductFilter,
  ] = useState('')

  const [
    movementTypeFilter,
    setMovementTypeFilter,
  ] = useState('')

  const [
    startDate,
    setStartDate,
  ] = useState('')

  const [
    endDate,
    setEndDate,
  ] = useState('')

  const [
    appliedMovementFilters,
    setAppliedMovementFilters,
  ] = useState({
    productId: '',
    type: '',
    startDate: '',
    endDate: '',
  })

  const [
    products,
    setProducts,
  ] = useState([])

  const [
    movementModalOpen,
    setMovementModalOpen,
  ] = useState(false)

  const [
    movementForm,
    setMovementForm,
  ] = useState(
    EMPTY_MOVEMENT_FORM
  )

  const [
    selectedStock,
    setSelectedStock,
  ] = useState(null)

  const [
    movementError,
    setMovementError,
  ] = useState('')

  const [
    movementSaving,
    setMovementSaving,
  ] = useState(false)

  const [
    detailsMovement,
    setDetailsMovement,
  ] = useState(null)

  const [
    toast,
    setToast,
  ] = useState(null)

  const loadStocks =
    useCallback(
      async () => {
        try {
          setStockLoading(true)
          setStockError('')

          const response =
            await stockService.list({
              search:
                appliedStockSearch,

              active:
                getActiveFilter(
                  stockStatus
                ),

              page:
                stockPage,

              size: 20,
            })

          setStocks(
            response.content
              || []
          )

          setStockTotalPages(
            response.totalPages
              || 0
          )

          setStockTotalElements(
            response.totalElements
              || 0
          )
        } catch (
          error
        ) {
          console.error(
            'Erro ao carregar estoque:',
            error
          )

          setStockError(
            getErrorMessage(
              error
            )
          )
        } finally {
          setStockLoading(false)
        }
      },
      [
        appliedStockSearch,
        stockStatus,
        stockPage,
      ]
    )

  const loadMovements =
    useCallback(
      async () => {
        try {
          setMovementsLoading(
            true
          )

          setMovementsError('')

          const response =
            await stockService
              .listMovements({
                productId:
                  appliedMovementFilters
                    .productId
                    || null,

                type:
                  appliedMovementFilters
                    .type
                    || null,

                start:
                  createStartDateTime(
                    appliedMovementFilters
                      .startDate
                  ),

                end:
                  createEndDateTime(
                    appliedMovementFilters
                      .endDate
                  ),

                page:
                  movementPage,

                size: 20,
              })

          setMovements(
            response.content
              || []
          )

          setMovementTotalPages(
            response.totalPages
              || 0
          )

          setMovementTotalElements(
            response.totalElements
              || 0
          )
        } catch (
          error
        ) {
          console.error(
            'Erro ao carregar movimentações:',
            error
          )

          setMovementsError(
            getErrorMessage(
              error
            )
          )
        } finally {
          setMovementsLoading(
            false
          )
        }
      },
      [
        appliedMovementFilters,
        movementPage,
      ]
    )

  const loadProducts =
    useCallback(
      async () => {
        try {
          const response =
            await productService.list({
              active: true,
              page: 0,
              size: 100,
            })

          setProducts(
            response.content
              || []
          )
        } catch (
          error
        ) {
          console.error(
            'Erro ao carregar produtos:',
            error
          )
        }
      },
      []
    )

  useEffect(() => {
    loadStocks()
  }, [loadStocks])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (
      activeTab
      === 'history'
    ) {
      loadMovements()
    }
  }, [
    activeTab,
    loadMovements,
  ])

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

  const showToast =
    (message) => {
      setToast({
        message,
      })
    }

  const handleStockSearch =
    (event) => {
      event.preventDefault()

      setStockPage(0)

      setAppliedStockSearch(
        stockSearch.trim()
      )
    }

  const clearStockSearch =
    () => {
      setStockSearch('')
      setAppliedStockSearch('')
      setStockPage(0)
    }

  const handleStockStatus =
    (event) => {
      setStockStatus(
        event.target.value
      )

      setStockPage(0)
    }

  const openMovementModal =
    (stock = null) => {
      setSelectedStock(
        stock
      )

      setMovementForm({
        ...EMPTY_MOVEMENT_FORM,

        productId:
          stock
            ? String(
                stock.productId
              )
            : '',
      })

      setMovementError('')
      setMovementModalOpen(true)
    }

  const closeMovementModal =
    () => {
      if (movementSaving) {
        return
      }

      setMovementModalOpen(
        false
      )

      setSelectedStock(null)

      setMovementForm({
        ...EMPTY_MOVEMENT_FORM,
      })

      setMovementError('')
    }

  const handleMovementChange =
    (event) => {
      const {
        name,
        value,
      } = event.target

      let newValue =
        value

      if (
        name === 'quantity'
      ) {
        newValue =
          value.replace(
            /\D/g,
            ''
          )
      }

      setMovementForm(
        (current) => ({
          ...current,
          [name]:
            newValue,
        })
      )
    }

  const handleMovementSubmit =
    async (event) => {
      event.preventDefault()

      const validation =
        validateMovement(
          movementForm,
          selectedStock
        )

      if (validation) {
        setMovementError(
          validation
        )

        return
      }

      try {
        setMovementSaving(true)
        setMovementError('')

        const result =
          await stockService.move({
            productId:
              movementForm
                .productId,

            type:
              movementForm.type,

            quantity:
              movementForm
                .quantity,

            reason:
              movementForm.reason,
          })

        const movementLabel =
          MOVEMENT_TYPES[
            movementForm.type
          ]?.shortLabel
          || 'Movimentação'

        showToast(
          `${movementLabel} registrada com sucesso. Novo saldo: ${result.stock.quantity}.`
        )

        setMovementModalOpen(
          false
        )

        setSelectedStock(null)

        setMovementForm({
          ...EMPTY_MOVEMENT_FORM,
        })

        await loadStocks()

        if (
          activeTab
          === 'history'
        ) {
          await loadMovements()
        }
      } catch (
        error
      ) {
        console.error(
          'Erro ao movimentar estoque:',
          error
        )

        setMovementError(
          getErrorMessage(
            error
          )
        )
      } finally {
        setMovementSaving(
          false
        )
      }
    }

  const applyMovementFilters =
    (event) => {
      event.preventDefault()

      if (
        startDate
        && endDate
        && startDate > endDate
      ) {
        setMovementsError(
          'A data inicial deve ser anterior ou igual à data final.'
        )

        return
      }

      setMovementsError('')

      setMovementPage(0)

      setAppliedMovementFilters({
        productId:
          movementProductFilter,

        type:
          movementTypeFilter,

        startDate,

        endDate,
      })
    }

  const clearMovementFilters =
    () => {
      setMovementProductFilter(
        ''
      )

      setMovementTypeFilter(
        ''
      )

      setStartDate('')
      setEndDate('')

      setMovementPage(0)

      setAppliedMovementFilters({
        productId: '',
        type: '',
        startDate: '',
        endDate: '',
      })
    }

  const lowStockCount =
    stocks.filter(
      (stock) =>
        stock.active
        && stock.lowStock
    ).length

  const normalStockCount =
    stocks.filter(
      (stock) =>
        stock.active
        && !stock.lowStock
    ).length

  const totalQuantity =
    stocks.reduce(
      (
        total,
        stock
      ) =>
        total
        + Number(
          stock.quantity
          || 0
        ),
      0
    )

  return (
    <div className="stock-page">
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

      <section className="stock-header">
        <div>
          <span className="stock-header-label">
            CONTROLE
          </span>

          <h1>
            Estoque
          </h1>

          <p>
            Acompanhe os saldos,
            níveis mínimos e
            movimentações dos
            produtos.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            className="stock-primary-button"
            onClick={() =>
              openMovementModal()
            }
          >
            <MovementIcon />

            Nova movimentação
          </button>
        )}
      </section>

      <section className="stock-summary-grid">
        <SummaryCard
          title="Produtos encontrados"
          value={
            stockTotalElements
          }
          icon={
            <BoxIcon />
          }
        />

        <SummaryCard
          title="Unidades nesta página"
          value={
            totalQuantity
          }
          icon={
            <LayersIcon />
          }
        />

        <SummaryCard
          title="Estoque baixo nesta página"
          value={
            lowStockCount
          }
          icon={
            <WarningIcon />
          }
          warning={
            lowStockCount > 0
          }
        />

        <SummaryCard
          title="Estoque normal nesta página"
          value={
            normalStockCount
          }
          icon={
            <CheckIcon />
          }
        />
      </section>

      <section className="stock-content">
        <div className="stock-tabs">
          <button
            type="button"
            className={
              activeTab
              === 'stock'
                ? 'stock-tab stock-tab-active'
                : 'stock-tab'
            }
            onClick={() =>
              setActiveTab(
                'stock'
              )
            }
          >
            <BoxIcon />

            Estoque atual
          </button>

          <button
            type="button"
            className={
              activeTab
              === 'history'
                ? 'stock-tab stock-tab-active'
                : 'stock-tab'
            }
            onClick={() =>
              setActiveTab(
                'history'
              )
            }
          >
            <HistoryIcon />

            Histórico de movimentações
          </button>
        </div>

        {activeTab === 'stock'
          ? (
            <StockCurrentTab
              stocks={
                stocks
              }
              loading={
                stockLoading
              }
              error={
                stockError
              }
              search={
                stockSearch
              }
              appliedSearch={
                appliedStockSearch
              }
              status={
                stockStatus
              }
              page={
                stockPage
              }
              totalPages={
                stockTotalPages
              }
              totalElements={
                stockTotalElements
              }
              canManage={
                canManage
              }
              onSearchChange={
                setStockSearch
              }
              onSearch={
                handleStockSearch
              }
              onClearSearch={
                clearStockSearch
              }
              onStatusChange={
                handleStockStatus
              }
              onPageChange={
                setStockPage
              }
              onMovement={
                openMovementModal
              }
              onClearError={() =>
                setStockError('')
              }
            />
          )
          : (
            <MovementHistoryTab
              movements={
                movements
              }
              products={
                products
              }
              loading={
                movementsLoading
              }
              error={
                movementsError
              }
              productFilter={
                movementProductFilter
              }
              typeFilter={
                movementTypeFilter
              }
              startDate={
                startDate
              }
              endDate={
                endDate
              }
              page={
                movementPage
              }
              totalPages={
                movementTotalPages
              }
              totalElements={
                movementTotalElements
              }
              onProductChange={
                setMovementProductFilter
              }
              onTypeChange={
                setMovementTypeFilter
              }
              onStartChange={
                setStartDate
              }
              onEndChange={
                setEndDate
              }
              onApply={
                applyMovementFilters
              }
              onClear={
                clearMovementFilters
              }
              onPageChange={
                setMovementPage
              }
              onDetails={
                setDetailsMovement
              }
              onClearError={() =>
                setMovementsError('')
              }
            />
          )}
      </section>

      {movementModalOpen && (
        <MovementModal
          form={
            movementForm
          }
          stock={
            selectedStock
          }
          products={
            products
          }
          error={
            movementError
          }
          saving={
            movementSaving
          }
          onChange={
            handleMovementChange
          }
          onSubmit={
            handleMovementSubmit
          }
          onClose={
            closeMovementModal
          }
        />
      )}

      {detailsMovement && (
        <MovementDetailsModal
          movement={
            detailsMovement
          }
          onClose={() =>
            setDetailsMovement(
              null
            )
          }
        />
      )}
    </div>
  )
}

function StockCurrentTab({
  stocks,
  loading,
  error,
  search,
  appliedSearch,
  status,
  page,
  totalPages,
  totalElements,
  canManage,
  onSearchChange,
  onSearch,
  onClearSearch,
  onStatusChange,
  onPageChange,
  onMovement,
  onClearError,
}) {
  return (
    <>
      <div className="stock-toolbar">
        <form
          className="stock-search"
          onSubmit={
            onSearch
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
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Buscar por produto ou SKU"
          />

          {search && (
            <button
              type="button"
              className="stock-search-clear"
              onClick={
                onClearSearch
              }
            >
              ×
            </button>
          )}

          <button
            type="submit"
            className="stock-search-button"
          >
            Buscar
          </button>
        </form>

        <select
          className="stock-filter-select"
          value={
            status
          }
          onChange={
            onStatusChange
          }
        >
          <option value="ACTIVE">
            Produtos ativos
          </option>

          <option value="ALL">
            Todos os produtos
          </option>

          <option value="INACTIVE">
            Produtos inativos
          </option>
        </select>
      </div>

      {appliedSearch && (
        <div className="stock-applied-filter">
          Resultados para:

          <strong>
            {' '}
            "{appliedSearch}"
          </strong>

          <button
            type="button"
            onClick={
              onClearSearch
            }
          >
            Limpar
          </button>
        </div>
      )}

      {error && (
        <ErrorMessage
          message={
            error
          }
          onClose={
            onClearError
          }
        />
      )}

      {loading ? (
        <Loading
          text="Carregando estoque..."
        />
      ) : stocks.length
        === 0 ? (
        <EmptyState
          title="Nenhum estoque encontrado"
          description="Nenhum produto corresponde aos filtros selecionados."
        />
      ) : (
        <>
          <div className="stock-table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>
                    Produto
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Quantidade
                  </th>

                  <th>
                    Estoque mínimo
                  </th>

                  <th>
                    Situação
                  </th>

                  <th>
                    Produto
                  </th>

                  <th>
                    Atualizado em
                  </th>

                  {canManage && (
                    <th className="stock-actions-heading">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {stocks.map(
                  (stock) => (
                    <StockRow
                      key={
                        stock.id
                      }
                      stock={
                        stock
                      }
                      canManage={
                        canManage
                      }
                      onMovement={() =>
                        onMovement(
                          stock
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
            itemLabel="produto"
            itemLabelPlural="produtos"
            onPageChange={
              onPageChange
            }
          />
        </>
      )}
    </>
  )
}

function StockRow({
  stock,
  canManage,
  onMovement,
}) {
  return (
    <tr
      className={
        stock.lowStock
        && stock.active
          ? 'stock-row-low'
          : ''
      }
    >
      <td>
        <div className="stock-product-cell">
          <div className="stock-product-icon">
            <BoxIcon />
          </div>

          <div>
            <strong>
              {stock.productName}
            </strong>

            {stock.lowStock
              && stock.active && (
              <span>
                Reposição recomendada
              </span>
            )}
          </div>
        </div>
      </td>

      <td>
        <span className="stock-sku">
          {stock.sku}
        </span>
      </td>

      <td>
        <strong
          className={
            stock.lowStock
            && stock.active
              ? 'stock-quantity stock-quantity-low'
              : 'stock-quantity'
          }
        >
          {stock.quantity}
        </strong>
      </td>

      <td>
        {stock.minimumStock}
      </td>

      <td>
        <StockLevelBadge
          lowStock={
            stock.lowStock
          }
          active={
            stock.active
          }
        />
      </td>

      <td>
        <ProductStatusBadge
          active={
            stock.active
          }
        />
      </td>

      <td>
        {formatDateTime(
          stock.updatedAt
        )}
      </td>

      {canManage && (
        <td>
          <div className="stock-row-actions">
            <button
              type="button"
              disabled={
                !stock.active
              }
              title={
                stock.active
                  ? 'Registrar movimentação'
                  : 'Produto inativo'
              }
              onClick={
                onMovement
              }
            >
              <MovementIcon />
            </button>
          </div>
        </td>
      )}
    </tr>
  )
}

function MovementHistoryTab({
  movements,
  products,
  loading,
  error,
  productFilter,
  typeFilter,
  startDate,
  endDate,
  page,
  totalPages,
  totalElements,
  onProductChange,
  onTypeChange,
  onStartChange,
  onEndChange,
  onApply,
  onClear,
  onPageChange,
  onDetails,
  onClearError,
}) {
  return (
    <>
      <form
        className="stock-history-filters"
        onSubmit={
          onApply
        }
      >
        <div className="stock-filter-group">
          <label>
            Produto
          </label>

          <select
            value={
              productFilter
            }
            onChange={(
              event
            ) =>
              onProductChange(
                event.target.value
              )
            }
          >
            <option value="">
              Todos os produtos
            </option>

            {products.map(
              (product) => (
                <option
                  key={
                    product.id
                  }
                  value={
                    product.id
                  }
                >
                  {product.name}
                  {' - '}
                  {product.sku}
                </option>
              )
            )}
          </select>
        </div>

        <div className="stock-filter-group">
          <label>
            Tipo
          </label>

          <select
            value={
              typeFilter
            }
            onChange={(
              event
            ) =>
              onTypeChange(
                event.target.value
              )
            }
          >
            <option value="">
              Todos os tipos
            </option>

            <option value="ENTRY">
              Entrada
            </option>

            <option value="EXIT">
              Saída
            </option>

            <option value="ADJUSTMENT">
              Ajuste
            </option>
          </select>
        </div>

        <div className="stock-filter-group">
          <label>
            Data inicial
          </label>

          <input
            type="date"
            value={
              startDate
            }
            onChange={(
              event
            ) =>
              onStartChange(
                event.target.value
              )
            }
          />
        </div>

        <div className="stock-filter-group">
          <label>
            Data final
          </label>

          <input
            type="date"
            value={
              endDate
            }
            onChange={(
              event
            ) =>
              onEndChange(
                event.target.value
              )
            }
          />
        </div>

        <div className="stock-filter-actions">
          <button
            type="button"
            className="stock-secondary-button"
            onClick={
              onClear
            }
          >
            Limpar
          </button>

          <button
            type="submit"
            className="stock-primary-button"
          >
            <FilterIcon />

            Filtrar
          </button>
        </div>
      </form>

      {error && (
        <ErrorMessage
          message={
            error
          }
          onClose={
            onClearError
          }
        />
      )}

      {loading ? (
        <Loading
          text="Carregando movimentações..."
        />
      ) : movements.length
        === 0 ? (
        <EmptyState
          title="Nenhuma movimentação encontrada"
          description="Ainda não existem movimentações para os filtros selecionados."
        />
      ) : (
        <>
          <div className="stock-table-wrapper">
            <table className="stock-table stock-history-table">
              <thead>
                <tr>
                  <th>
                    Data
                  </th>

                  <th>
                    Produto
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    Quantidade
                  </th>

                  <th>
                    Saldo anterior
                  </th>

                  <th>
                    Novo saldo
                  </th>

                  <th>
                    Responsável
                  </th>

                  <th className="stock-actions-heading">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {movements.map(
                  (movement) => (
                    <MovementRow
                      key={
                        movement.id
                      }
                      movement={
                        movement
                      }
                      onDetails={() =>
                        onDetails(
                          movement
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
            itemLabel="movimentação"
            itemLabelPlural="movimentações"
            onPageChange={
              onPageChange
            }
          />
        </>
      )}
    </>
  )
}

function MovementRow({
  movement,
  onDetails,
}) {
  return (
    <tr>
      <td>
        {formatDateTime(
          movement.createdAt
        )}
      </td>

      <td>
        <strong>
          {movement.productName}
        </strong>
      </td>

      <td>
        <MovementBadge
          type={
            movement.type
          }
        />
      </td>

      <td>
        <strong
          className={
            getMovementQuantityClass(
              movement.type
            )
          }
        >
          {formatMovementQuantity(
            movement
          )}
        </strong>
      </td>

      <td>
        {movement.previousQuantity}
      </td>

      <td>
        <strong>
          {movement.newQuantity}
        </strong>
      </td>

      <td>
        {movement.userName}
      </td>

      <td>
        <div className="stock-row-actions">
          <button
            type="button"
            title="Visualizar movimentação"
            onClick={
              onDetails
            }
          >
            <EyeIcon />
          </button>
        </div>
      </td>
    </tr>
  )
}

function MovementModal({
  form,
  stock,
  products,
  error,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  const selectedProduct =
    stock
    || products.find(
      (product) =>
        String(product.id)
        === String(
          form.productId
        )
    )

  const currentQuantity =
    stock?.quantity

  const preview =
    calculatePreview(
      currentQuantity,
      form.quantity,
      form.type
    )

  return (
    <div
      className="stock-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="stock-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="stock-modal-header">
          <div>
            <span>
              MOVIMENTAÇÃO
            </span>

            <h2>
              Registrar movimentação
            </h2>

            <p>
              Registre entradas,
              saídas ou ajustes no
              saldo do produto.
            </p>
          </div>

          <button
            type="button"
            className="stock-modal-close"
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
          <div className="stock-modal-body">
            <div className="stock-form-group">
              <label htmlFor="stock-product">
                Produto *
              </label>

              <select
                id="stock-product"
                name="productId"
                value={
                  form.productId
                }
                disabled={
                  Boolean(stock)
                  || saving
                }
                onChange={
                  onChange
                }
              >
                <option value="">
                  Selecione um produto
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={
                        product.id
                      }
                      value={
                        product.id
                      }
                    >
                      {product.name}
                      {' - '}
                      {product.sku}
                    </option>
                  )
                )}
              </select>
            </div>

            {selectedProduct && (
              <div className="stock-selected-product">
                <div className="stock-selected-product-icon">
                  <BoxIcon />
                </div>

                <div>
                  <span>
                    Produto selecionado
                  </span>

                  <strong>
                    {selectedProduct.productName
                      || selectedProduct.name}
                  </strong>

                  <small>
                    SKU:
                    {' '}
                    {selectedProduct.sku}
                  </small>
                </div>

                {stock && (
                  <div className="stock-current-balance">
                    <span>
                      Saldo atual
                    </span>

                    <strong>
                      {stock.quantity}
                    </strong>
                  </div>
                )}
              </div>
            )}

            <div className="stock-form-group">
              <label>
                Tipo de movimentação *
              </label>

              <div className="stock-movement-types">
                <MovementTypeButton
                  type="ENTRY"
                  selected={
                    form.type
                    === 'ENTRY'
                  }
                  disabled={
                    saving
                  }
                  onClick={() =>
                    onChange({
                      target: {
                        name: 'type',
                        value: 'ENTRY',
                      },
                    })
                  }
                />

                <MovementTypeButton
                  type="EXIT"
                  selected={
                    form.type
                    === 'EXIT'
                  }
                  disabled={
                    saving
                  }
                  onClick={() =>
                    onChange({
                      target: {
                        name: 'type',
                        value: 'EXIT',
                      },
                    })
                  }
                />

                <MovementTypeButton
                  type="ADJUSTMENT"
                  selected={
                    form.type
                    === 'ADJUSTMENT'
                  }
                  disabled={
                    saving
                  }
                  onClick={() =>
                    onChange({
                      target: {
                        name: 'type',
                        value: 'ADJUSTMENT',
                      },
                    })
                  }
                />
              </div>
            </div>

            <MovementExplanation
              type={
                form.type
              }
            />

            <div className="stock-form-group">
              <label htmlFor="stock-quantity">
                {form.type
                  === 'ADJUSTMENT'
                    ? 'Novo saldo *'
                    : 'Quantidade *'}
              </label>

              <input
                id="stock-quantity"
                type="text"
                name="quantity"
                inputMode="numeric"
                value={
                  form.quantity
                }
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder={
                  form.type
                  === 'ADJUSTMENT'
                    ? 'Informe o novo saldo'
                    : 'Informe a quantidade'
                }
              />
            </div>

            {stock
              && form.quantity && (
              <div className="stock-balance-preview">
                <div>
                  <span>
                    Saldo atual
                  </span>

                  <strong>
                    {stock.quantity}
                  </strong>
                </div>

                <ArrowRightIcon />

                <div>
                  <span>
                    Novo saldo
                  </span>

                  <strong
                    className={
                      preview < 0
                        ? 'stock-preview-error'
                        : ''
                    }
                  >
                    {preview}
                  </strong>
                </div>
              </div>
            )}

            <div className="stock-form-group">
              <label htmlFor="stock-reason">
                Motivo
              </label>

              <textarea
                id="stock-reason"
                name="reason"
                rows="4"
                maxLength="500"
                value={
                  form.reason
                }
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="Ex.: Compra de fornecedor, venda, correção de inventário..."
              />

              <span className="stock-character-count">
                {form.reason.length}
                /500
              </span>
            </div>

            {error && (
              <div className="stock-form-error">
                <WarningIcon />

                <span>
                  {error}
                </span>
              </div>
            )}
          </div>

          <div className="stock-modal-footer">
            <button
              type="button"
              className="stock-secondary-button"
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
              className="stock-primary-button"
              disabled={
                saving
              }
            >
              {saving
                ? 'Registrando...'
                : 'Registrar movimentação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MovementTypeButton({
  type,
  selected,
  disabled,
  onClick,
}) {
  const config =
    MOVEMENT_TYPES[type]

  return (
    <button
      type="button"
      disabled={
        disabled
      }
      className={
        selected
          ? `stock-movement-type stock-movement-type-active stock-movement-${type.toLowerCase()}`
          : 'stock-movement-type'
      }
      onClick={
        onClick
      }
    >
      {type === 'ENTRY' && (
        <EntryIcon />
      )}

      {type === 'EXIT' && (
        <ExitIcon />
      )}

      {type === 'ADJUSTMENT' && (
        <AdjustmentIcon />
      )}

      <span>
        {config.label}
      </span>
    </button>
  )
}

function MovementExplanation({
  type,
}) {
  let text = ''

  if (type === 'ENTRY') {
    text =
      'A quantidade informada será adicionada ao saldo atual.'
  }

  if (type === 'EXIT') {
    text =
      'A quantidade informada será retirada do saldo atual. O sistema não permite saldo negativo.'
  }

  if (
    type === 'ADJUSTMENT'
  ) {
    text =
      'A quantidade informada substituirá o saldo atual. Use esta opção para correções de inventário.'
  }

  return (
    <div className="stock-movement-explanation">
      <InfoIcon />

      <span>
        {text}
      </span>
    </div>
  )
}

function MovementDetailsModal({
  movement,
  onClose,
}) {
  return (
    <div
      className="stock-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="stock-modal stock-details-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="stock-modal-header">
          <div>
            <span>
              HISTÓRICO
            </span>

            <h2>
              Detalhes da movimentação
            </h2>

            <p>
              Registro completo da
              alteração realizada no
              estoque.
            </p>
          </div>

          <button
            type="button"
            className="stock-modal-close"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </div>

        <div className="stock-details-body">
          <div className="stock-details-product">
            <div className="stock-selected-product-icon">
              <BoxIcon />
            </div>

            <div>
              <span>
                Produto
              </span>

              <strong>
                {movement.productName}
              </strong>
            </div>

            <MovementBadge
              type={
                movement.type
              }
            />
          </div>

          <div className="stock-details-grid">
            <DetailItem
              label="Quantidade movimentada"
              value={
                formatMovementQuantity(
                  movement
                )
              }
            />

            <DetailItem
              label="Saldo anterior"
              value={
                movement.previousQuantity
              }
            />

            <DetailItem
              label="Novo saldo"
              value={
                movement.newQuantity
              }
            />

            <DetailItem
              label="Responsável"
              value={
                movement.userName
              }
            />

            <DetailItem
              label="Data e hora"
              value={
                formatDateTime(
                  movement.createdAt
                )
              }
            />

            <DetailItem
              label="ID da movimentação"
              value={
                `#${movement.id}`
              }
            />
          </div>

          <div className="stock-details-reason">
            <span>
              Motivo
            </span>

            <p>
              {movement.reason
                || 'Nenhum motivo informado.'}
            </p>
          </div>

          <div className="stock-audit-box">
            <HistoryIcon />

            <div>
              <strong>
                Registro de auditoria
              </strong>

              <p>
                Esta movimentação foi
                registrada por
                {' '}
                <b>
                  {movement.userName}
                </b>
                {' '}
                e alterou o saldo de
                {' '}
                <b>
                  {movement.previousQuantity}
                </b>
                {' '}
                para
                {' '}
                <b>
                  {movement.newQuantity}
                </b>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="stock-modal-footer">
          <button
            type="button"
            className="stock-primary-button"
            onClick={
              onClose
            }
          >
            Fechar
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
  warning = false,
}) {
  return (
    <div
      className={
        warning
          ? 'stock-summary-card stock-summary-warning'
          : 'stock-summary-card'
      }
    >
      <div className="stock-summary-icon">
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

function StockLevelBadge({
  lowStock,
  active,
}) {
  if (!active) {
    return (
      <span className="stock-level-badge stock-level-disabled">
        Indisponível
      </span>
    )
  }

  if (lowStock) {
    return (
      <span className="stock-level-badge stock-level-low">
        <WarningIcon />

        Estoque baixo
      </span>
    )
  }

  return (
    <span className="stock-level-badge stock-level-normal">
      <CheckIcon />

      Normal
    </span>
  )
}

function ProductStatusBadge({
  active,
}) {
  return (
    <span
      className={
        active
          ? 'stock-product-status stock-product-active'
          : 'stock-product-status stock-product-inactive'
      }
    >
      <span />

      {active
        ? 'Ativo'
        : 'Inativo'}
    </span>
  )
}

function MovementBadge({
  type,
}) {
  const label =
    MOVEMENT_TYPES[type]
      ?.shortLabel
    || type

  return (
    <span
      className={`stock-movement-badge stock-movement-badge-${type?.toLowerCase()}`}
    >
      {type === 'ENTRY'
        && <EntryIcon />}

      {type === 'EXIT'
        && <ExitIcon />}

      {type === 'ADJUSTMENT'
        && <AdjustmentIcon />}

      {label}
    </span>
  )
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="stock-detail-item">
      <span>
        {label}
      </span>

      <strong>
        {value ?? '-'}
      </strong>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  totalElements,
  itemLabel,
  itemLabelPlural,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return (
      <div className="stock-pagination stock-pagination-single">
        <span>
          {totalElements}
          {' '}
          {totalElements === 1
            ? itemLabel
            : itemLabelPlural}
        </span>
      </div>
    )
  }

  return (
    <div className="stock-pagination">
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

function Loading({
  text,
}) {
  return (
    <div className="stock-loading">
      <div className="stock-spinner" />

      <span>
        {text}
      </span>
    </div>
  )
}

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="stock-empty">
      <div className="stock-empty-icon">
        <BoxIcon />
      </div>

      <strong>
        {title}
      </strong>

      <p>
        {description}
      </p>
    </div>
  )
}

function ErrorMessage({
  message,
  onClose,
}) {
  return (
    <div className="stock-error-message">
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
    <div className="stock-toast">
      <div className="stock-toast-icon">
        <CheckIcon />
      </div>

      <div className="stock-toast-content">
        <strong>
          Operação concluída
        </strong>

        <span>
          {message}
        </span>
      </div>

      <button
        type="button"
        className="stock-toast-close"
        onClick={
          onClose
        }
      >
        ×
      </button>

      <div className="stock-toast-progress" />
    </div>
  )
}

function validateMovement(
  form,
  stock
) {
  if (!form.productId) {
    return 'Selecione o produto.'
  }

  if (
    ![
      'ENTRY',
      'EXIT',
      'ADJUSTMENT',
    ].includes(
      form.type
    )
  ) {
    return 'Selecione um tipo de movimentação válido.'
  }

  if (
    form.quantity === ''
  ) {
    return form.type
      === 'ADJUSTMENT'
      ? 'Informe o novo saldo.'
      : 'Informe a quantidade.'
  }

  const quantity =
    Number(
      form.quantity
    )

  if (
    !Number.isInteger(
      quantity
    )
    || quantity <= 0
  ) {
    return 'A quantidade deve ser um número inteiro maior que zero.'
  }

  if (
    quantity
    > 2147483647
  ) {
    return 'A quantidade ultrapassa o limite permitido.'
  }

  if (
    form.type === 'EXIT'
    && stock
    && quantity
      > Number(
        stock.quantity
      )
  ) {
    return 'Estoque insuficiente para realizar esta saída.'
  }

  if (
    form.reason.length > 500
  ) {
    return 'O motivo deve possuir no máximo 500 caracteres.'
  }

  return ''
}

function calculatePreview(
  currentQuantity,
  movementQuantity,
  type
) {
  const current =
    Number(
      currentQuantity
    )

  const quantity =
    Number(
      movementQuantity
    )

  if (
    !Number.isFinite(current)
    || !Number.isFinite(quantity)
  ) {
    return currentQuantity
  }

  if (type === 'ENTRY') {
    return current + quantity
  }

  if (type === 'EXIT') {
    return current - quantity
  }

  if (
    type === 'ADJUSTMENT'
  ) {
    return quantity
  }

  return current
}

function createStartDateTime(
  date
) {
  if (!date) {
    return null
  }

  return `${date}T00:00:00`
}

function createEndDateTime(
  date
) {
  if (!date) {
    return null
  }

  const [
    year,
    month,
    day,
  ] =
    date
      .split('-')
      .map(Number)

  const nextDay =
    new Date(
      year,
      month - 1,
      day + 1
    )

  const nextYear =
    nextDay.getFullYear()

  const nextMonth =
    String(
      nextDay.getMonth()
      + 1
    ).padStart(
      2,
      '0'
    )

  const nextDate =
    String(
      nextDay.getDate()
    ).padStart(
      2,
      '0'
    )

  return `${nextYear}-${nextMonth}-${nextDate}T00:00:00`
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

function formatMovementQuantity(
  movement
) {
  if (
    movement.type
    === 'ENTRY'
  ) {
    return `+${movement.quantity}`
  }

  if (
    movement.type
    === 'EXIT'
  ) {
    return `-${movement.quantity}`
  }

  return `→ ${movement.newQuantity}`
}

function getMovementQuantityClass(
  type
) {
  if (type === 'ENTRY') {
    return 'stock-movement-value stock-movement-value-entry'
  }

  if (type === 'EXIT') {
    return 'stock-movement-value stock-movement-value-exit'
  }

  return 'stock-movement-value stock-movement-value-adjustment'
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
        dateStyle:
          'short',

        timeStyle:
          'short',
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

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m4 8 8-4 8 4-8 4-8-4Z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </svg>
  )
}

function MovementIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M7 7h11" />
      <path d="m15 4 3 3-3 3" />
      <path d="M17 17H6" />
      <path d="m9 14-3 3 3 3" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
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

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
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
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function EntryIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 4v16" />
      <path d="m6 10 6-6 6 6" />
    </svg>
  )
}

function ExitIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 4v16" />
      <path d="m6 14 6 6 6-6" />
    </svg>
  )
}

function AdjustmentIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <circle cx="16" cy="7" r="2" />
      <path d="M4 17h2" />
      <path d="M10 17h10" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m15 8 4 4-4 4" />
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

export default StockPage