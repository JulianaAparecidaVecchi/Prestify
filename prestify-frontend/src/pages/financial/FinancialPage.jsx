import { useCallback, useEffect, useMemo, useState } from 'react'
import financialService from '../../services/financialService'
import authService from '../../services/authService'
import './FinancialPage.css'

const EMPTY_FORM = {
  description: '',
  type: 'INCOME',
  amount: '',
  category: '',
  dueDate: '',
  clientId: '',
  supplierId: '',
  notes: '',
}

const EMPTY_PAYMENT_FORM = {
  paymentMethod: 'PIX',
  paymentDate: '',
}

const PAYMENT_METHODS = [
  {
    value: 'CASH',
    label: 'Dinheiro',
  },
  {
    value: 'PIX',
    label: 'PIX',
  },
  {
    value: 'CREDIT_CARD',
    label: 'Cartão de crédito',
  },
  {
    value: 'DEBIT_CARD',
    label: 'Cartão de débito',
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Transferência bancária',
  },
  {
    value: 'BOLETO',
    label: 'Boleto',
  },
  {
    value: 'OTHER',
    label: 'Outro',
  },
]

function FinancialPage() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({
    paidIncome: 0,
    paidExpense: 0,
    profit: 0,
    receivable: 0,
    payable: 0,
  })

  const [clients, setClients] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [searchInput, setSearchInput] = useState('')

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  })

  const [modal, setModal] = useState(null)
  const [selectedTransaction, setSelectedTransaction] =
    useState(null)

  const [form, setForm] = useState(EMPTY_FORM)

  const [paymentForm, setPaymentForm] = useState(
    EMPTY_PAYMENT_FORM
  )

  const [toast, setToast] = useState(null)

  const user = authService.getUser()

  const role = user?.role || ''

  const hasFinancialAccess = [
    'OWNER',
    'ADMIN',
    'MANAGER',
  ].includes(role)

  const canManage = hasFinancialAccess

  const showToast = useCallback((message, type = 'success') => {
    setToast({
      message,
      type,
    })

    window.setTimeout(() => {
      setToast(null)
    }, 3500)
  }, [])

  const getErrorMessage = useCallback((requestError) => {
    const data = requestError?.response?.data

    if (typeof data === 'string' && data.trim()) {
      return data
    }

    if (data?.message) {
      return data.message
    }

    if (data?.error) {
      return data.error
    }

    return 'Não foi possível concluir a operação.'
  }, [])

  const loadTransactions = useCallback(async () => {
    if (!hasFinancialAccess) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await financialService.list({
        ...filters,
        page,
        size: 20,
      })

      setTransactions(response?.content || [])
      setTotalPages(response?.totalPages || 0)
      setTotalElements(response?.totalElements || 0)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [
    filters,
    getErrorMessage,
    hasFinancialAccess,
    page,
  ])

  const loadSummary = useCallback(async () => {
    if (!hasFinancialAccess) {
      return
    }

    try {
      const response = await financialService.getSummary({
        startDate: filters.startDate,
        endDate: filters.endDate,
      })

      setSummary({
        paidIncome: response?.paidIncome || 0,
        paidExpense: response?.paidExpense || 0,
        profit: response?.profit || 0,
        receivable: response?.receivable || 0,
        payable: response?.payable || 0,
      })
    } catch (requestError) {
      showToast(
        getErrorMessage(requestError),
        'error'
      )
    }
  }, [
    filters.endDate,
    filters.startDate,
    getErrorMessage,
    hasFinancialAccess,
    showToast,
  ])

  const loadRelations = useCallback(async () => {
    if (!hasFinancialAccess) {
      return
    }

    try {
      const [clientsResponse, suppliersResponse] =
        await Promise.all([
          financialService.getActiveClients(),
          financialService.getActiveSuppliers(),
        ])

      setClients(clientsResponse)
      setSuppliers(suppliersResponse)
    } catch {
      setClients([])
      setSuppliers([])
    }
  }, [hasFinancialAccess])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    loadRelations()
  }, [loadRelations])

  const formatCurrency = (value) => {
    const numberValue = Number(value || 0)

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue)
  }

  const formatDate = (value) => {
    if (!value) {
      return 'Não informado'
    }

    const [year, month, day] = value.split('-')

    if (!year || !month || !day) {
      return value
    }

    return `${day}/${month}/${year}`
  }

  const formatDateTime = (value) => {
    if (!value) {
      return 'Não informado'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date)
  }

  const getTypeLabel = (type) => {
    if (type === 'INCOME') {
      return 'Receita'
    }

    if (type === 'EXPENSE') {
      return 'Despesa'
    }

    return type || '-'
  }

  const getStatusLabel = (transaction) => {
    if (transaction.status === 'PENDING') {
      return 'Pendente'
    }

    if (transaction.status === 'CANCELLED') {
      return 'Cancelado'
    }

    if (transaction.status === 'PAID') {
      return transaction.type === 'INCOME'
        ? 'Recebido'
        : 'Pago'
    }

    return transaction.status || '-'
  }

  const getPaymentMethodLabel = (paymentMethod) => {
    const method = PAYMENT_METHODS.find(
      (item) => item.value === paymentMethod
    )

    return method?.label || paymentMethod || 'Não informado'
  }

  const getRelationName = (transaction) => {
    if (transaction.type === 'INCOME') {
      return transaction.clientName || 'Sem cliente'
    }

    if (transaction.type === 'EXPENSE') {
      return transaction.supplierName || 'Sem fornecedor'
    }

    return '-'
  }

  const handleApplyFilters = (event) => {
    event.preventDefault()

    setPage(0)

    setFilters((current) => ({
      ...current,
      search: searchInput.trim(),
    }))
  }

  const handleClearFilters = () => {
    setSearchInput('')

    setFilters({
      search: '',
      type: '',
      status: '',
      startDate: '',
      endDate: '',
    })

    setPage(0)
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target

    setFilters((current) => ({
      ...current,
      [name]: value,
    }))

    setPage(0)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target

    if (name === 'type') {
      setForm((current) => ({
        ...current,
        type: value,
        clientId:
          value === 'INCOME'
            ? current.clientId
            : '',
        supplierId:
          value === 'EXPENSE'
            ? current.supplierId
            : '',
      }))

      return
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const openCreateModal = () => {
    setSelectedTransaction(null)
    setForm(EMPTY_FORM)
    setModal('form')
  }

  const openEditModal = (transaction) => {
    setSelectedTransaction(transaction)

    setForm({
      description: transaction.description || '',
      type: transaction.type || 'INCOME',
      amount:
        transaction.amount !== null &&
        transaction.amount !== undefined
          ? String(transaction.amount)
          : '',
      category: transaction.category || '',
      dueDate: transaction.dueDate || '',
      clientId: transaction.clientId
        ? String(transaction.clientId)
        : '',
      supplierId: transaction.supplierId
        ? String(transaction.supplierId)
        : '',
      notes: transaction.notes || '',
    })

    setModal('form')
  }

  const openViewModal = async (transaction) => {
    try {
      setSaving(true)

      const completeTransaction =
        await financialService.getById(
          transaction.id
        )

      setSelectedTransaction(completeTransaction)
      setModal('view')
    } catch (requestError) {
      showToast(
        getErrorMessage(requestError),
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const openPaymentModal = (transaction) => {
    setSelectedTransaction(transaction)

    setPaymentForm({
      paymentMethod: 'PIX',
      paymentDate: new Date()
        .toLocaleDateString('en-CA'),
    })

    setModal('payment')
  }

  const openCancelModal = (transaction) => {
    setSelectedTransaction(transaction)
    setModal('cancel')
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setModal(null)
    setSelectedTransaction(null)
    setForm(EMPTY_FORM)
    setPaymentForm(EMPTY_PAYMENT_FORM)
  }

  const validateFinancialForm = () => {
    if (!form.description.trim()) {
      showToast(
        'Informe a descrição do lançamento.',
        'error'
      )
      return false
    }

    if (form.description.trim().length > 180) {
      showToast(
        'A descrição deve ter no máximo 180 caracteres.',
        'error'
      )
      return false
    }

    if (!form.type) {
      showToast(
        'Selecione o tipo do lançamento.',
        'error'
      )
      return false
    }

    const amount = Number(form.amount)

    if (
      !Number.isFinite(amount) ||
      amount < 0.01
    ) {
      showToast(
        'Informe um valor maior ou igual a R$ 0,01.',
        'error'
      )
      return false
    }

    if (!form.dueDate) {
      showToast(
        'Informe a data de vencimento.',
        'error'
      )
      return false
    }

    if (
      form.category &&
      form.category.trim().length > 100
    ) {
      showToast(
        'A categoria deve ter no máximo 100 caracteres.',
        'error'
      )
      return false
    }

    if (
      form.notes &&
      form.notes.trim().length > 2000
    ) {
      showToast(
        'As observações devem ter no máximo 2000 caracteres.',
        'error'
      )
      return false
    }

    return true
  }

  const buildFinancialPayload = () => {
    return {
      description: form.description.trim(),
      type: form.type,
      amount: Number(form.amount),
      category: form.category.trim() || null,
      dueDate: form.dueDate,
      supplierId:
        form.type === 'EXPENSE' &&
        form.supplierId
          ? Number(form.supplierId)
          : null,
      clientId:
        form.type === 'INCOME' &&
        form.clientId
          ? Number(form.clientId)
          : null,
      notes: form.notes.trim() || null,
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateFinancialForm()) {
      return
    }

    try {
      setSaving(true)

      const payload = buildFinancialPayload()

      if (selectedTransaction) {
        await financialService.update(
          selectedTransaction.id,
          payload
        )

        showToast(
          'Lançamento atualizado com sucesso.'
        )
      } else {
        await financialService.create(payload)

        showToast(
          'Lançamento criado com sucesso.'
        )
      }

      closeModal()
      await Promise.all([
        loadTransactions(),
        loadSummary(),
      ])
    } catch (requestError) {
      showToast(
        getErrorMessage(requestError),
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const handlePaymentChange = (event) => {
    const { name, value } = event.target

    setPaymentForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleConfirmPayment = async (
    event
  ) => {
    event.preventDefault()

    if (!selectedTransaction) {
      return
    }

    if (!paymentForm.paymentMethod) {
      showToast(
        'Selecione a forma de pagamento.',
        'error'
      )
      return
    }

    try {
      setSaving(true)

      await financialService.changeStatus(
        selectedTransaction.id,
        {
          status: 'PAID',
          paymentMethod:
            paymentForm.paymentMethod,
          paymentDate:
            paymentForm.paymentDate || null,
        }
      )

      showToast(
        selectedTransaction.type === 'INCOME'
          ? 'Receita recebida com sucesso.'
          : 'Despesa paga com sucesso.'
      )

      closeModal()

      await Promise.all([
        loadTransactions(),
        loadSummary(),
      ])
    } catch (requestError) {
      showToast(
        getErrorMessage(requestError),
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmCancel = async () => {
    if (!selectedTransaction) {
      return
    }

    try {
      setSaving(true)

      await financialService.changeStatus(
        selectedTransaction.id,
        {
          status: 'CANCELLED',
          paymentMethod: null,
          paymentDate: null,
        }
      )

      showToast(
        'Lançamento cancelado com sucesso.'
      )

      closeModal()

      await Promise.all([
        loadTransactions(),
        loadSummary(),
      ])
    } catch (requestError) {
      showToast(
        getErrorMessage(requestError),
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) {
      return []
    }

    const first = Math.max(0, page - 2)
    const last = Math.min(
      totalPages - 1,
      first + 4
    )

    const adjustedFirst = Math.max(
      0,
      last - 4
    )

    const numbers = []

    for (
      let index = adjustedFirst;
      index <= last;
      index += 1
    ) {
      numbers.push(index)
    }

    return numbers
  }, [page, totalPages])

  if (!hasFinancialAccess) {
    return (
      <div className="financial-page">
        <div className="financial-access-denied">
          <div className="financial-access-icon">
            $
          </div>

          <h2>Acesso restrito</h2>

          <p>
            Seu perfil não possui permissão para
            acessar o módulo financeiro.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="financial-page">
      {toast && (
        <div
          className={`financial-toast financial-toast-${toast.type}`}
        >
          {toast.message}
        </div>
      )}

      <div className="financial-heading">
        <div>
          <h1>Financeiro</h1>

          <p>
            Acompanhe receitas, despesas e
            vencimentos do seu negócio.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            className="financial-primary-button"
            onClick={openCreateModal}
          >
            <span>+</span>
            Novo lançamento
          </button>
        )}
      </div>

      <section className="financial-summary-grid">
        <article className="financial-summary-card financial-summary-income">
          <div className="financial-summary-card-top">
            <span className="financial-summary-label">
              Receitas recebidas
            </span>

            <span className="financial-summary-symbol">
              ↑
            </span>
          </div>

          <strong>
            {formatCurrency(summary.paidIncome)}
          </strong>

          <small>
            Valores efetivamente recebidos
          </small>
        </article>

        <article className="financial-summary-card financial-summary-expense">
          <div className="financial-summary-card-top">
            <span className="financial-summary-label">
              Despesas pagas
            </span>

            <span className="financial-summary-symbol">
              ↓
            </span>
          </div>

          <strong>
            {formatCurrency(summary.paidExpense)}
          </strong>

          <small>
            Valores efetivamente pagos
          </small>
        </article>

        <article
          className={`financial-summary-card ${
            Number(summary.profit) >= 0
              ? 'financial-summary-profit-positive'
              : 'financial-summary-profit-negative'
          }`}
        >
          <div className="financial-summary-card-top">
            <span className="financial-summary-label">
              Resultado
            </span>

            <span className="financial-summary-symbol">
              =
            </span>
          </div>

          <strong>
            {formatCurrency(summary.profit)}
          </strong>

          <small>
            Receitas menos despesas realizadas
          </small>
        </article>

        <article className="financial-summary-card">
          <div className="financial-summary-card-top">
            <span className="financial-summary-label">
              A receber
            </span>

            <span className="financial-summary-symbol">
              R$
            </span>
          </div>

          <strong>
            {formatCurrency(summary.receivable)}
          </strong>

          <small>
            Receitas pendentes
          </small>
        </article>

        <article className="financial-summary-card">
          <div className="financial-summary-card-top">
            <span className="financial-summary-label">
              A pagar
            </span>

            <span className="financial-summary-symbol">
              R$
            </span>
          </div>

          <strong>
            {formatCurrency(summary.payable)}
          </strong>

          <small>
            Despesas pendentes
          </small>
        </article>
      </section>

      <section className="financial-card">
        <form
          className="financial-filters"
          onSubmit={handleApplyFilters}
        >
          <div className="financial-search">
            <span className="financial-search-icon">
              ⌕
            </span>

            <input
              type="text"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              placeholder="Buscar por descrição ou categoria..."
            />
          </div>

          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">
              Todos os tipos
            </option>
            <option value="INCOME">
              Receitas
            </option>
            <option value="EXPENSE">
              Despesas
            </option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">
              Todos os status
            </option>
            <option value="PENDING">
              Pendente
            </option>
            <option value="PAID">
              Pago / Recebido
            </option>
            <option value="CANCELLED">
              Cancelado
            </option>
          </select>

          <div className="financial-date-filter">
            <label>De</label>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="financial-date-filter">
            <label>Até</label>

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <button
            type="submit"
            className="financial-filter-button"
          >
            Buscar
          </button>

          <button
            type="button"
            className="financial-clear-button"
            onClick={handleClearFilters}
          >
            Limpar
          </button>
        </form>
      </section>

      <section className="financial-card financial-table-card">
        <div className="financial-table-heading">
          <div>
            <h2>Lançamentos</h2>

            <p>
              {totalElements}{' '}
              {totalElements === 1
                ? 'lançamento encontrado'
                : 'lançamentos encontrados'}
            </p>
          </div>
        </div>

        {error && (
          <div className="financial-error-box">
            <p>{error}</p>

            <button
              type="button"
              onClick={loadTransactions}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="financial-loading">
            <div className="financial-spinner" />
            <span>
              Carregando lançamentos...
            </span>
          </div>
        )}

        {!error &&
          !loading &&
          transactions.length === 0 && (
            <div className="financial-empty">
              <div className="financial-empty-icon">
                $
              </div>

              <h3>
                Nenhum lançamento encontrado
              </h3>

              <p>
                Ajuste os filtros ou crie um
                novo lançamento financeiro.
              </p>
            </div>
          )}

        {!error &&
          !loading &&
          transactions.length > 0 && (
            <>
              <div className="financial-table-wrapper">
                <table className="financial-table">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Tipo</th>
                      <th>Categoria</th>
                      <th>Cliente / Fornecedor</th>
                      <th>Vencimento</th>
                      <th>Status</th>
                      <th>Valor</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map(
                      (transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <button
                              type="button"
                              className="financial-description-button"
                              onClick={() =>
                                openViewModal(
                                  transaction
                                )
                              }
                            >
                              {transaction.description}
                            </button>
                          </td>

                          <td>
                            <span
                              className={`financial-type financial-type-${transaction.type.toLowerCase()}`}
                            >
                              {getTypeLabel(
                                transaction.type
                              )}
                            </span>
                          </td>

                          <td>
                            {transaction.category ||
                              '-'}
                          </td>

                          <td>
                            {getRelationName(
                              transaction
                            )}
                          </td>

                          <td>
                            {formatDate(
                              transaction.dueDate
                            )}
                          </td>

                          <td>
                            <span
                              className={`financial-status financial-status-${transaction.status.toLowerCase()}`}
                            >
                              {getStatusLabel(
                                transaction
                              )}
                            </span>
                          </td>

                          <td
                            className={`financial-amount financial-amount-${transaction.type.toLowerCase()}`}
                          >
                            {transaction.type ===
                            'INCOME'
                              ? '+ '
                              : '- '}

                            {formatCurrency(
                              transaction.amount
                            )}
                          </td>

                          <td>
                            <div className="financial-actions">
                              <button
                                type="button"
                                className="financial-action-button"
                                title="Visualizar"
                                onClick={() =>
                                  openViewModal(
                                    transaction
                                  )
                                }
                              >
                                Ver
                              </button>

                              {transaction.status ===
                                'PENDING' && (
                                <>
                                  <button
                                    type="button"
                                    className="financial-action-button"
                                    title="Editar"
                                    onClick={() =>
                                      openEditModal(
                                        transaction
                                      )
                                    }
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    className="financial-action-button financial-action-payment"
                                    title={
                                      transaction.type ===
                                      'INCOME'
                                        ? 'Receber'
                                        : 'Pagar'
                                    }
                                    onClick={() =>
                                      openPaymentModal(
                                        transaction
                                      )
                                    }
                                  >
                                    {transaction.type ===
                                    'INCOME'
                                      ? 'Receber'
                                      : 'Pagar'}
                                  </button>

                                  <button
                                    type="button"
                                    className="financial-action-button financial-action-cancel"
                                    title="Cancelar"
                                    onClick={() =>
                                      openCancelModal(
                                        transaction
                                      )
                                    }
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="financial-pagination">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(
                          0,
                          current - 1
                        )
                      )
                    }
                  >
                    Anterior
                  </button>

                  <div className="financial-page-numbers">
                    {pageNumbers.map(
                      (pageNumber) => (
                        <button
                          type="button"
                          key={pageNumber}
                          className={
                            pageNumber === page
                              ? 'active'
                              : ''
                          }
                          onClick={() =>
                            setPage(pageNumber)
                          }
                        >
                          {pageNumber + 1}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={
                      page >= totalPages - 1
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages - 1,
                          current + 1
                        )
                      )
                    }
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
      </section>

      {modal === 'form' && (
        <div
          className="financial-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal()
            }
          }}
        >
          <div className="financial-modal financial-modal-large">
            <div className="financial-modal-header">
              <div>
                <h2>
                  {selectedTransaction
                    ? 'Editar lançamento'
                    : 'Novo lançamento'}
                </h2>

                <p>
                  {selectedTransaction
                    ? 'Altere os dados do lançamento pendente.'
                    : 'Cadastre uma nova receita ou despesa.'}
                </p>
              </div>

              <button
                type="button"
                className="financial-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              className="financial-form"
              onSubmit={handleSubmit}
            >
              <div className="financial-form-grid">
                <div className="financial-field financial-field-full">
                  <label htmlFor="description">
                    Descrição *
                  </label>

                  <input
                    id="description"
                    name="description"
                    type="text"
                    maxLength={180}
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Ex.: Pagamento mensal do cliente"
                    required
                  />
                </div>

                <div className="financial-field">
                  <label htmlFor="type">
                    Tipo *
                  </label>

                  <select
                    id="type"
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="INCOME">
                      Receita
                    </option>

                    <option value="EXPENSE">
                      Despesa
                    </option>
                  </select>
                </div>

                <div className="financial-field">
                  <label htmlFor="amount">
                    Valor *
                  </label>

                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={handleFormChange}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="financial-field">
                  <label htmlFor="category">
                    Categoria
                  </label>

                  <input
                    id="category"
                    name="category"
                    type="text"
                    maxLength={100}
                    value={form.category}
                    onChange={handleFormChange}
                    placeholder="Ex.: Serviços"
                  />
                </div>

                <div className="financial-field">
                  <label htmlFor="dueDate">
                    Vencimento *
                  </label>

                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                {form.type === 'INCOME' && (
                  <div className="financial-field financial-field-full">
                    <label htmlFor="clientId">
                      Cliente
                    </label>

                    <select
                      id="clientId"
                      name="clientId"
                      value={form.clientId}
                      onChange={handleFormChange}
                    >
                      <option value="">
                        Sem cliente vinculado
                      </option>

                      {clients.map((client) => (
                        <option
                          key={client.id}
                          value={client.id}
                        >
                          {client.name}
                        </option>
                      ))}
                    </select>

                    <small>
                      Opcional. Apenas clientes
                      ativos podem ser vinculados.
                    </small>
                  </div>
                )}

                {form.type === 'EXPENSE' && (
                  <div className="financial-field financial-field-full">
                    <label htmlFor="supplierId">
                      Fornecedor
                    </label>

                    <select
                      id="supplierId"
                      name="supplierId"
                      value={form.supplierId}
                      onChange={handleFormChange}
                    >
                      <option value="">
                        Sem fornecedor vinculado
                      </option>

                      {suppliers.map(
                        (supplier) => (
                          <option
                            key={supplier.id}
                            value={supplier.id}
                          >
                            {supplier.name}
                          </option>
                        )
                      )}
                    </select>

                    <small>
                      Opcional. Apenas fornecedores
                      ativos podem ser vinculados.
                    </small>
                  </div>
                )}

                <div className="financial-field financial-field-full">
                  <label htmlFor="notes">
                    Observações
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    maxLength={2000}
                    rows={4}
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder="Adicione informações complementares..."
                  />

                  <small>
                    {form.notes.length}/2000
                  </small>
                </div>
              </div>

              <div className="financial-modal-actions">
                <button
                  type="button"
                  className="financial-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="financial-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Salvando...'
                    : selectedTransaction
                      ? 'Salvar alterações'
                      : 'Criar lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'payment' &&
        selectedTransaction && (
          <div
            className="financial-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal()
              }
            }}
          >
            <div className="financial-modal">
              <div className="financial-modal-header">
                <div>
                  <h2>
                    {selectedTransaction.type ===
                    'INCOME'
                      ? 'Receber receita'
                      : 'Pagar despesa'}
                  </h2>

                  <p>
                    Registre a baixa deste
                    lançamento financeiro.
                  </p>
                </div>

                <button
                  type="button"
                  className="financial-modal-close"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>

              <div className="financial-payment-summary">
                <span>
                  {selectedTransaction.description}
                </span>

                <strong>
                  {formatCurrency(
                    selectedTransaction.amount
                  )}
                </strong>
              </div>

              <form
                className="financial-form"
                onSubmit={handleConfirmPayment}
              >
                <div className="financial-field">
                  <label htmlFor="paymentMethod">
                    Forma de pagamento *
                  </label>

                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={
                      paymentForm.paymentMethod
                    }
                    onChange={
                      handlePaymentChange
                    }
                    required
                  >
                    {PAYMENT_METHODS.map(
                      (method) => (
                        <option
                          key={method.value}
                          value={method.value}
                        >
                          {method.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="financial-field">
                  <label htmlFor="paymentDate">
                    Data do pagamento
                  </label>

                  <input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    value={
                      paymentForm.paymentDate
                    }
                    onChange={
                      handlePaymentChange
                    }
                  />

                  <small>
                    Se não informar, o backend
                    utilizará a data atual.
                  </small>
                </div>

                <div className="financial-modal-actions">
                  <button
                    type="button"
                    className="financial-secondary-button"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Voltar
                  </button>

                  <button
                    type="submit"
                    className="financial-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? 'Confirmando...'
                      : selectedTransaction.type ===
                          'INCOME'
                        ? 'Confirmar recebimento'
                        : 'Confirmar pagamento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {modal === 'cancel' &&
        selectedTransaction && (
          <div
            className="financial-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal()
              }
            }}
          >
            <div className="financial-modal financial-confirm-modal">
              <div className="financial-confirm-symbol">
                !
              </div>

              <h2>Cancelar lançamento?</h2>

              <p>
                O lançamento{' '}
                <strong>
                  {selectedTransaction.description}
                </strong>{' '}
                será marcado como cancelado e não
                poderá ser reativado.
              </p>

              <div className="financial-confirm-details">
                <span>
                  {getTypeLabel(
                    selectedTransaction.type
                  )}
                </span>

                <strong>
                  {formatCurrency(
                    selectedTransaction.amount
                  )}
                </strong>
              </div>

              <div className="financial-modal-actions">
                <button
                  type="button"
                  className="financial-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Voltar
                </button>

                <button
                  type="button"
                  className="financial-danger-button"
                  onClick={handleConfirmCancel}
                  disabled={saving}
                >
                  {saving
                    ? 'Cancelando...'
                    : 'Cancelar lançamento'}
                </button>
              </div>
            </div>
          </div>
        )}

      {modal === 'view' &&
        selectedTransaction && (
          <div
            className="financial-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal()
              }
            }}
          >
            <div className="financial-modal financial-modal-large">
              <div className="financial-modal-header">
                <div>
                  <h2>Detalhes do lançamento</h2>

                  <p>
                    Informações completas do
                    registro financeiro.
                  </p>
                </div>

                <button
                  type="button"
                  className="financial-modal-close"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>

              <div className="financial-detail-main">
                <div>
                  <span className="financial-detail-label">
                    Descrição
                  </span>

                  <h3>
                    {
                      selectedTransaction.description
                    }
                  </h3>
                </div>

                <div className="financial-detail-value">
                  <span
                    className={`financial-type financial-type-${selectedTransaction.type.toLowerCase()}`}
                  >
                    {getTypeLabel(
                      selectedTransaction.type
                    )}
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedTransaction.amount
                    )}
                  </strong>
                </div>
              </div>

              <div className="financial-detail-grid">
                <div className="financial-detail-item">
                  <span>Categoria</span>
                  <strong>
                    {selectedTransaction.category ||
                      'Não informada'}
                  </strong>
                </div>

                <div className="financial-detail-item">
                  <span>Status</span>
                  <strong>
                    {getStatusLabel(
                      selectedTransaction
                    )}
                  </strong>
                </div>

                <div className="financial-detail-item">
                  <span>Vencimento</span>
                  <strong>
                    {formatDate(
                      selectedTransaction.dueDate
                    )}
                  </strong>
                </div>

                <div className="financial-detail-item">
                  <span>
                    {selectedTransaction.type ===
                    'INCOME'
                      ? 'Cliente'
                      : 'Fornecedor'}
                  </span>

                  <strong>
                    {getRelationName(
                      selectedTransaction
                    )}
                  </strong>
                </div>

                <div className="financial-detail-item">
                  <span>
                    Data do pagamento
                  </span>

                  <strong>
                    {formatDate(
                      selectedTransaction.paymentDate
                    )}
                  </strong>
                </div>

                <div className="financial-detail-item">
                  <span>
                    Forma de pagamento
                  </span>

                  <strong>
                    {getPaymentMethodLabel(
                      selectedTransaction.paymentMethod
                    )}
                  </strong>
                </div>

                <div className="financial-detail-item">
                  <span>Criado por</span>

                  <strong>
                    {selectedTransaction.createdByUserName ||
                      'Não informado'}
                  </strong>
                </div>

                <div className="financial-detail-item">
                  <span>Criado em</span>

                  <strong>
                    {formatDateTime(
                      selectedTransaction.createdAt
                    )}
                  </strong>
                </div>

                <div className="financial-detail-item">
                  <span>Última atualização</span>

                  <strong>
                    {formatDateTime(
                      selectedTransaction.updatedAt
                    )}
                  </strong>
                </div>
              </div>

              <div className="financial-detail-notes">
                <span>Observações</span>

                <p>
                  {selectedTransaction.notes ||
                    'Nenhuma observação informada.'}
                </p>
              </div>

              <div className="financial-modal-actions">
                <button
                  type="button"
                  className="financial-secondary-button"
                  onClick={closeModal}
                >
                  Fechar
                </button>

                {selectedTransaction.status ===
                  'PENDING' && (
                  <>
                    <button
                      type="button"
                      className="financial-secondary-button"
                      onClick={() =>
                        openEditModal(
                          selectedTransaction
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="financial-primary-button"
                      onClick={() =>
                        openPaymentModal(
                          selectedTransaction
                        )
                      }
                    >
                      {selectedTransaction.type ===
                      'INCOME'
                        ? 'Receber'
                        : 'Pagar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default FinancialPage