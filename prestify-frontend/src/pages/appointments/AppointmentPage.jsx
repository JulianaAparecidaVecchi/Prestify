import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import appointmentService
  from '../../services/appointmentService'

import authService
  from '../../services/authService'

import './AppointmentPage.css'

const STATUS_LABELS = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

const STATUS_TRANSITIONS = {
  SCHEDULED: [
    'CONFIRMED',
    'CANCELLED',
    'NO_SHOW',
  ],

  CONFIRMED: [
    'IN_PROGRESS',
    'CANCELLED',
    'NO_SHOW',
  ],

  IN_PROGRESS: [
    'COMPLETED',
    'CANCELLED',
  ],

  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

const ADMIN_ROLES = [
  'OWNER',
  'ADMIN',
  'MANAGER',
]

function AppointmentPage() {
  const user =
    authService.getUser()

  const canEdit =
    ADMIN_ROLES.includes(
      user?.role
    )

  const today =
    new Date()

  const [selectedDate, setSelectedDate] =
    useState(
      formatDateInput(today)
    )

  const [appointments, setAppointments] =
    useState([])

  const [clients, setClients] =
    useState([])

  const [services, setServices] =
    useState([])

  const [professionals, setProfessionals] =
    useState([])

  const [professionalFilter, setProfessionalFilter] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [modalOpen, setModalOpen] =
    useState(false)

  const [editingAppointment, setEditingAppointment] =
    useState(null)

  const [selectedAppointment, setSelectedAppointment] =
    useState(null)

  const [detailsOpen, setDetailsOpen] =
    useState(false)

  const [confirmDelete, setConfirmDelete] =
    useState(null)

  const [form, setForm] =
    useState({
      clientId: '',
      serviceId: '',
      professionalId: '',
      date: formatDateInput(today),
      time: '',
      notes: '',
    })

  const loadSelectData =
    useCallback(
      async () => {
        try {
          const [
            clientsData,
            servicesData,
            professionalsData,
          ] = await Promise.all([
            appointmentService
              .listClients(),

            appointmentService
              .listServices(),

            appointmentService
              .listProfessionals(),
          ])

          setClients(
            clientsData
          )

          setServices(
            servicesData
          )

          setProfessionals(
            professionalsData
          )
        } catch (requestError) {
          setError(
            getErrorMessage(
              requestError,
              'Não foi possível carregar os dados da agenda.'
            )
          )
        }
      },
      []
    )

  const loadAppointments =
    useCallback(
      async () => {
        try {
          setLoading(true)
          setError('')

          const start =
            `${selectedDate}T00:00:00`

          const endDate =
            new Date(
              `${selectedDate}T00:00:00`
            )

          endDate.setDate(
            endDate.getDate() + 1
          )

          const end =
            `${formatDateInput(endDate)}T00:00:00`

          const data =
            await appointmentService.list({
              start,
              end,
              professionalId:
                professionalFilter ||
                null,

              status:
                statusFilter ||
                null,

              page: 0,
              size: 100,
            })

          setAppointments(
            data.content || []
          )
        } catch (requestError) {
          setError(
            getErrorMessage(
              requestError,
              'Não foi possível carregar os agendamentos.'
            )
          )

          setAppointments([])
        } finally {
          setLoading(false)
        }
      },
      [
        selectedDate,
        professionalFilter,
        statusFilter,
      ]
    )

  useEffect(() => {
    loadSelectData()
  }, [loadSelectData])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    if (!success) {
      return undefined
    }

    const timeout =
      setTimeout(
        () => {
          setSuccess('')
        },
        3500
      )

    return () =>
      clearTimeout(timeout)
  }, [success])

  const summary =
    useMemo(
      () => {
        const active =
          appointments.filter(
            (appointment) =>
              ![
                'CANCELLED',
                'NO_SHOW',
              ].includes(
                appointment.status
              )
          )

        const completed =
          appointments.filter(
            (appointment) =>
              appointment.status ===
              'COMPLETED'
          )

        const revenue =
          completed.reduce(
            (
              total,
              appointment
            ) =>
              total +
              Number(
                appointment.price ||
                0
              ),
            0
          )

        return {
          total:
            appointments.length,

          active:
            active.length,

          completed:
            completed.length,

          revenue,
        }
      },
      [appointments]
    )

  const openCreateModal = () => {
    setEditingAppointment(
      null
    )

    setForm({
      clientId: '',
      serviceId: '',
      professionalId: '',
      date: selectedDate,
      time: '',
      notes: '',
    })

    setError('')
    setModalOpen(true)
  }

  const openEditModal = (
    appointment
  ) => {
    setEditingAppointment(
      appointment
    )

    const dateTime =
      parseLocalDateTime(
        appointment.startTime
      )

    setForm({
      clientId:
        String(
          appointment.clientId
        ),

      serviceId:
        String(
          appointment.serviceId
        ),

      professionalId:
        String(
          appointment.professionalId
        ),

      date:
        formatDateInput(
          dateTime
        ),

      time:
        formatTimeInput(
          dateTime
        ),

      notes:
        appointment.notes ||
        '',
    })

    setDetailsOpen(false)
    setError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setModalOpen(false)

    setEditingAppointment(
      null
    )

    setError('')
  }

  const handleFormChange = (
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
  }

  const validateForm = () => {
    if (!form.clientId) {
      return 'Selecione um cliente.'
    }

    if (!form.serviceId) {
      return 'Selecione um serviço.'
    }

    if (!form.professionalId) {
      return 'Selecione um profissional.'
    }

    if (!form.date) {
      return 'Informe a data.'
    }

    if (!form.time) {
      return 'Informe o horário.'
    }

    if (
      form.notes.length >
      2000
    ) {
      return 'As observações devem possuir no máximo 2000 caracteres.'
    }

    const dateTime =
      new Date(
        `${form.date}T${form.time}:00`
      )

    if (
      dateTime.getTime() <
      Date.now()
    ) {
      return editingAppointment
        ? 'O agendamento não pode ser movido para o passado.'
        : 'O agendamento não pode ser criado no passado.'
    }

    return null
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      setError('')
      setSuccess('')

      const validation =
        validateForm()

      if (validation) {
        setError(
          validation
        )

        return
      }

      const payload = {
        clientId:
          Number(
            form.clientId
          ),

        serviceId:
          Number(
            form.serviceId
          ),

        professionalId:
          Number(
            form.professionalId
          ),

        startTime:
          `${form.date}T${form.time}:00`,

        notes:
          form.notes.trim() ||
          null,
      }

      try {
        setSaving(true)

        if (
          editingAppointment
        ) {
          await appointmentService
            .update(
              editingAppointment.id,
              payload
            )

          setSuccess(
            'Agendamento atualizado com sucesso.'
          )
        } else {
          await appointmentService
            .create(
              payload
            )

          setSuccess(
            'Agendamento criado com sucesso.'
          )
        }

        setModalOpen(false)

        setEditingAppointment(
          null
        )

        setSelectedDate(
          form.date
        )

        await loadAppointments()
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
            'Não foi possível salvar o agendamento.'
          )
        )
      } finally {
        setSaving(false)
      }
    }

  const openDetails =
    async (
      appointment
    ) => {
      try {
        setError('')

        const data =
          await appointmentService
            .getById(
              appointment.id
            )

        setSelectedAppointment(
          data
        )

        setDetailsOpen(true)
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
            'Não foi possível carregar o agendamento.'
          )
        )
      }
    }

  const handleStatusChange =
    async (
      appointment,
      newStatus
    ) => {
      try {
        setError('')
        setSuccess('')

        const updated =
          await appointmentService
            .changeStatus(
              appointment.id,
              newStatus
            )

        setSuccess(
          `Status alterado para "${STATUS_LABELS[newStatus]}".`
        )

        if (
          selectedAppointment?.id ===
          appointment.id
        ) {
          setSelectedAppointment(
            updated
          )
        }

        await loadAppointments()
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
            'Não foi possível alterar o status.'
          )
        )
      }
    }

  const handleDelete =
    async () => {
      if (!confirmDelete) {
        return
      }

      try {
        setSaving(true)
        setError('')
        setSuccess('')

        await appointmentService
          .remove(
            confirmDelete.id
          )

        setSuccess(
          'Agendamento cancelado com sucesso.'
        )

        setConfirmDelete(
          null
        )

        setDetailsOpen(false)

        setSelectedAppointment(
          null
        )

        await loadAppointments()
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
            'Não foi possível cancelar o agendamento.'
          )
        )
      } finally {
        setSaving(false)
      }
    }

  const moveDay = (
    amount
  ) => {
    const date =
      new Date(
        `${selectedDate}T12:00:00`
      )

    date.setDate(
      date.getDate() +
      amount
    )

    setSelectedDate(
      formatDateInput(
        date
      )
    )
  }

  const goToday = () => {
    setSelectedDate(
      formatDateInput(
        new Date()
      )
    )
  }

  return (
    <main className="appointment-page">
      <div className="appointment-toolbar">
        <div className="appointment-date-navigation">
          <button
            type="button"
            className="appointment-icon-button"
            onClick={() =>
              moveDay(-1)
            }
            aria-label="Dia anterior"
          >
            <ChevronLeftIcon />
          </button>

          <div className="appointment-date-box">
            <CalendarIcon />

            <input
              type="date"
              value={
                selectedDate
              }
              onChange={(
                event
              ) =>
                setSelectedDate(
                  event.target
                    .value
                )
              }
            />
          </div>

          <button
            type="button"
            className="appointment-icon-button"
            onClick={() =>
              moveDay(1)
            }
            aria-label="Próximo dia"
          >
            <ChevronRightIcon />
          </button>

          <button
            type="button"
            className="appointment-today-button"
            onClick={
              goToday
            }
          >
            Hoje
          </button>
        </div>

        <button
          type="button"
          className="appointment-new-button"
          onClick={
            openCreateModal
          }
        >
          <PlusIcon />
          Novo agendamento
        </button>
      </div>

      <section className="appointment-summary-grid">
        <SummaryCard
          label="Agendamentos"
          value={
            summary.total
          }
          detail="no dia selecionado"
          icon={
            <CalendarIcon />
          }
        />

        <SummaryCard
          label="Ativos"
          value={
            summary.active
          }
          detail="sem cancelados ou faltas"
          icon={
            <ClockIcon />
          }
        />

        <SummaryCard
          label="Concluídos"
          value={
            summary.completed
          }
          detail="atendimentos finalizados"
          icon={
            <CheckIcon />
          }
        />

        <SummaryCard
          label="Faturamento concluído"
          value={
            formatCurrency(
              summary.revenue
            )
          }
          detail="dos atendimentos concluídos"
          icon={
            <MoneyIcon />
          }
        />
      </section>

      <section className="appointment-main-card">
        <div className="appointment-main-header">
          <div>
            <h2>
              {formatDisplayDate(
                selectedDate
              )}
            </h2>

            <p>
              Visualize e gerencie os
              agendamentos do dia.
            </p>
          </div>

          <div className="appointment-filters">
            <select
              value={
                professionalFilter
              }
              onChange={(
                event
              ) =>
                setProfessionalFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="">
                Todos os profissionais
              </option>

              {professionals.map(
                (
                  professional
                ) => (
                  <option
                    key={
                      professional.id
                    }
                    value={
                      professional.id
                    }
                  >
                    {
                      professional.name
                    }
                  </option>
                )
              )}
            </select>

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

              {Object.entries(
                STATUS_LABELS
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <option
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {error &&
          !modalOpen && (
            <div className="appointment-alert appointment-alert-error">
              {error}
            </div>
          )}

        {success && (
          <div className="appointment-alert appointment-alert-success">
            {success}
          </div>
        )}

        {loading ? (
          <div className="appointment-loading">
            <div className="appointment-spinner" />

            <p>
              Carregando agenda...
            </p>
          </div>
        ) : appointments.length ===
          0 ? (
          <div className="appointment-empty">
            <div className="appointment-empty-icon">
              <CalendarIcon />
            </div>

            <h3>
              Nenhum agendamento
            </h3>

            <p>
              Não há agendamentos
              para os filtros
              selecionados.
            </p>

            <button
              type="button"
              onClick={
                openCreateModal
              }
            >
              <PlusIcon />
              Criar agendamento
            </button>
          </div>
        ) : (
          <div className="appointment-list">
            {appointments.map(
              (
                appointment
              ) => (
                <AppointmentCard
                  key={
                    appointment.id
                  }
                  appointment={
                    appointment
                  }
                  canEdit={
                    canEdit
                  }
                  onOpen={
                    openDetails
                  }
                  onEdit={
                    openEditModal
                  }
                  onStatusChange={
                    handleStatusChange
                  }
                  onDelete={
                    setConfirmDelete
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="appointment-modal-backdrop"
          onMouseDown={
            closeModal
          }
        >
          <div
            className="appointment-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="appointment-modal-header">
              <div>
                <h2>
                  {editingAppointment
                    ? 'Editar agendamento'
                    : 'Novo agendamento'}
                </h2>

                <p>
                  Preencha os dados
                  do atendimento.
                </p>
              </div>

              <button
                type="button"
                className="appointment-modal-close"
                onClick={
                  closeModal
                }
              >
                <CloseIcon />
              </button>
            </div>

            <form
              className="appointment-form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="appointment-form-grid">
                <div className="appointment-field appointment-field-full">
                  <label htmlFor="clientId">
                    Cliente *
                  </label>

                  <select
                    id="clientId"
                    name="clientId"
                    value={
                      form.clientId
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      saving
                    }
                  >
                    <option value="">
                      Selecione um cliente
                    </option>

                    {clients.map(
                      (
                        client
                      ) => (
                        <option
                          key={
                            client.id
                          }
                          value={
                            client.id
                          }
                        >
                          {
                            client.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="appointment-field">
                  <label htmlFor="serviceId">
                    Serviço *
                  </label>

                  <select
                    id="serviceId"
                    name="serviceId"
                    value={
                      form.serviceId
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      saving
                    }
                  >
                    <option value="">
                      Selecione
                    </option>

                    {services.map(
                      (
                        service
                      ) => (
                        <option
                          key={
                            service.id
                          }
                          value={
                            service.id
                          }
                        >
                          {
                            service.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="appointment-field">
                  <label htmlFor="professionalId">
                    Profissional *
                  </label>

                  <select
                    id="professionalId"
                    name="professionalId"
                    value={
                      form.professionalId
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      saving
                    }
                  >
                    <option value="">
                      Selecione
                    </option>

                    {professionals.map(
                      (
                        professional
                      ) => (
                        <option
                          key={
                            professional.id
                          }
                          value={
                            professional.id
                          }
                        >
                          {
                            professional.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="appointment-field">
                  <label htmlFor="date">
                    Data *
                  </label>

                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={
                      form.date
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                <div className="appointment-field">
                  <label htmlFor="time">
                    Horário *
                  </label>

                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={
                      form.time
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                <div className="appointment-field appointment-field-full">
                  <label htmlFor="notes">
                    Observações
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    rows="5"
                    maxLength="2000"
                    placeholder="Informações adicionais sobre o atendimento..."
                    value={
                      form.notes
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      saving
                    }
                  />

                  <span className="appointment-character-counter">
                    {
                      form.notes
                        .length
                    }
                    /2000
                  </span>
                </div>
              </div>

              {form.serviceId && (
                <SelectedServiceInfo
                  service={
                    services.find(
                      (
                        service
                      ) =>
                        String(
                          service.id
                        ) ===
                        String(
                          form.serviceId
                        )
                    )
                  }
                />
              )}

              {error && (
                <div className="appointment-alert appointment-alert-error">
                  {error}
                </div>
              )}

              <div className="appointment-modal-actions">
                <button
                  type="button"
                  className="appointment-secondary-button"
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
                  className="appointment-primary-button"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? 'Salvando...'
                    : editingAppointment
                      ? 'Salvar alterações'
                      : 'Criar agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsOpen &&
        selectedAppointment && (
          <AppointmentDetailsModal
            appointment={
              selectedAppointment
            }
            canEdit={
              canEdit
            }
            onClose={() => {
              setDetailsOpen(
                false
              )

              setSelectedAppointment(
                null
              )
            }}
            onEdit={
              openEditModal
            }
            onStatusChange={
              handleStatusChange
            }
            onDelete={
              setConfirmDelete
            }
          />
        )}

      {confirmDelete && (
        <div className="appointment-modal-backdrop">
          <div className="appointment-confirm-modal">
            <div className="appointment-confirm-icon">
              <WarningIcon />
            </div>

            <h2>
              Cancelar agendamento?
            </h2>

            <p>
              O agendamento de{' '}
              <strong>
                {
                  confirmDelete.clientName
                }
              </strong>{' '}
              será cancelado, mas
              continuará armazenado
              no histórico.
            </p>

            <div className="appointment-modal-actions">
              <button
                type="button"
                className="appointment-secondary-button"
                onClick={() =>
                  setConfirmDelete(
                    null
                  )
                }
                disabled={
                  saving
                }
              >
                Voltar
              </button>

              <button
                type="button"
                className="appointment-danger-button"
                onClick={
                  handleDelete
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? 'Cancelando...'
                  : 'Cancelar agendamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}) {
  return (
    <article className="appointment-summary-card">
      <div className="appointment-summary-icon">
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {detail}
        </small>
      </div>
    </article>
  )
}

function AppointmentCard({
  appointment,
  canEdit,
  onOpen,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  const transitions =
    STATUS_TRANSITIONS[
      appointment.status
    ] || []

  return (
    <article className="appointment-card">
      <div className="appointment-card-time">
        <strong>
          {formatTime(
            appointment.startTime
          )}
        </strong>

        <span>
          {formatTime(
            appointment.endTime
          )}
        </span>
      </div>

      <div className="appointment-card-main">
        <div className="appointment-card-title-row">
          <div>
            <h3>
              {
                appointment.clientName
              }
            </h3>

            <p>
              {
                appointment.serviceName
              }
            </p>
          </div>

          <StatusBadge
            status={
              appointment.status
            }
          />
        </div>

        <div className="appointment-card-meta">
          <span>
            <UserIcon />
            {
              appointment.professionalName
            }
          </span>

          <span>
            <ClockIcon />
            {
              appointment.durationMinutes
            } min
          </span>

          <span>
            <MoneyIcon />
            {formatCurrency(
              appointment.price
            )}
          </span>
        </div>

        {appointment.notes && (
          <p className="appointment-card-notes">
            {
              appointment.notes
            }
          </p>
        )}
      </div>

      <div className="appointment-card-actions">
        <button
          type="button"
          className="appointment-action-button"
          onClick={() =>
            onOpen(
              appointment
            )
          }
        >
          Ver detalhes
        </button>

        {canEdit &&
          ![
            'COMPLETED',
            'CANCELLED',
          ].includes(
            appointment.status
          ) && (
            <button
              type="button"
              className="appointment-action-icon-button"
              onClick={() =>
                onEdit(
                  appointment
                )
              }
              title="Editar"
            >
              <EditIcon />
            </button>
          )}

        {transitions.length >
          0 && (
          <select
            className="appointment-status-select"
            value=""
            onChange={(
              event
            ) => {
              if (
                event.target.value
              ) {
                onStatusChange(
                  appointment,
                  event.target.value
                )
              }
            }}
          >
            <option value="">
              Alterar status
            </option>

            {transitions.map(
              (status) => (
                <option
                  key={
                    status
                  }
                  value={
                    status
                  }
                >
                  {
                    STATUS_LABELS[
                      status
                    ]
                  }
                </option>
              )
            )}
          </select>
        )}

        {canEdit &&
          ![
            'COMPLETED',
            'CANCELLED',
          ].includes(
            appointment.status
          ) && (
            <button
              type="button"
              className="appointment-action-icon-button appointment-action-danger"
              onClick={() =>
                onDelete(
                  appointment
                )
              }
              title="Cancelar agendamento"
            >
              <TrashIcon />
            </button>
          )}
      </div>
    </article>
  )
}

function AppointmentDetailsModal({
  appointment,
  canEdit,
  onClose,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  const transitions =
    STATUS_TRANSITIONS[
      appointment.status
    ] || []

  return (
    <div
      className="appointment-modal-backdrop"
      onMouseDown={
        onClose
      }
    >
      <div
        className="appointment-modal appointment-details-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="appointment-modal-header">
          <div>
            <h2>
              Detalhes do agendamento
            </h2>

            <p>
              Agendamento #
              {
                appointment.id
              }
            </p>
          </div>

          <button
            type="button"
            className="appointment-modal-close"
            onClick={
              onClose
            }
          >
            <CloseIcon />
          </button>
        </div>

        <div className="appointment-details-status">
          <StatusBadge
            status={
              appointment.status
            }
          />
        </div>

        <div className="appointment-details-grid">
          <Detail
            label="Cliente"
            value={
              appointment.clientName
            }
          />

          <Detail
            label="Serviço"
            value={
              appointment.serviceName
            }
          />

          <Detail
            label="Profissional"
            value={
              appointment.professionalName
            }
          />

          <Detail
            label="Data"
            value={
              formatDateTimeDate(
                appointment.startTime
              )
            }
          />

          <Detail
            label="Horário"
            value={`${formatTime(
              appointment.startTime
            )} - ${formatTime(
              appointment.endTime
            )}`}
          />

          <Detail
            label="Duração"
            value={`${appointment.durationMinutes} minutos`}
          />

          <Detail
            label="Preço"
            value={
              formatCurrency(
                appointment.price
              )
            }
          />

          <Detail
            label="Criado em"
            value={
              formatDateTime(
                appointment.createdAt
              )
            }
          />
        </div>

        <div className="appointment-details-notes">
          <span>
            Observações
          </span>

          <p>
            {appointment.notes ||
              'Nenhuma observação informada.'}
          </p>
        </div>

        <div className="appointment-details-actions">
          {canEdit &&
            ![
              'COMPLETED',
              'CANCELLED',
            ].includes(
              appointment.status
            ) && (
              <button
                type="button"
                className="appointment-secondary-button"
                onClick={() =>
                  onEdit(
                    appointment
                  )
                }
              >
                <EditIcon />
                Editar
              </button>
            )}

          {transitions.map(
            (
              status
            ) => (
              <button
                type="button"
                key={
                  status
                }
                className={
                  status ===
                  'CANCELLED'
                    ? 'appointment-danger-outline-button'
                    : 'appointment-primary-button'
                }
                onClick={() =>
                  onStatusChange(
                    appointment,
                    status
                  )
                }
              >
                {
                  STATUS_LABELS[
                    status
                  ]
                }
              </button>
            )
          )}

          {canEdit &&
            ![
              'COMPLETED',
              'CANCELLED',
            ].includes(
              appointment.status
            ) && (
              <button
                type="button"
                className="appointment-danger-outline-button"
                onClick={() =>
                  onDelete(
                    appointment
                  )
                }
              >
                <TrashIcon />
                Cancelar
              </button>
            )}
        </div>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="appointment-detail">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  )
}

function SelectedServiceInfo({
  service,
}) {
  if (!service) {
    return null
  }

  return (
    <div className="appointment-service-info">
      <div>
        <span>
          Duração
        </span>

        <strong>
          {
            service.durationMinutes
          } min
        </strong>
      </div>

      <div>
        <span>
          Valor
        </span>

        <strong>
          {formatCurrency(
            service.price
          )}
        </strong>
      </div>
    </div>
  )
}

function StatusBadge({
  status,
}) {
  return (
    <span
      className={`appointment-status-badge appointment-status-${status.toLowerCase()}`}
    >
      {
        STATUS_LABELS[
          status
        ] || status
      }
    </span>
  )
}

function formatDateInput(
  date
) {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    )

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    )

  return `${year}-${month}-${day}`
}

function parseLocalDateTime(
  value
) {
  if (!value) {
    return new Date()
  }

  return new Date(
    value
  )
}

function formatTimeInput(
  date
) {
  return `${String(
    date.getHours()
  ).padStart(
    2,
    '0'
  )}:${String(
    date.getMinutes()
  ).padStart(
    2,
    '0'
  )}`
}

function formatTime(
  value
) {
  if (!value) {
    return '--:--'
  }

  const date =
    parseLocalDateTime(
      value
    )

  return date.toLocaleTimeString(
    'pt-BR',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

function formatDisplayDate(
  value
) {
  const date =
    new Date(
      `${value}T12:00:00`
    )

  const formatted =
    date.toLocaleDateString(
      'pt-BR',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    )

  return (
    formatted.charAt(0)
      .toUpperCase() +
    formatted.slice(1)
  )
}

function formatDateTimeDate(
  value
) {
  if (!value) {
    return '-'
  }

  return parseLocalDateTime(
    value
  ).toLocaleDateString(
    'pt-BR'
  )
}

function formatDateTime(
  value
) {
  if (!value) {
    return '-'
  }

  return parseLocalDateTime(
    value
  ).toLocaleString(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    }
  )
}

function formatCurrency(
  value
) {
  return Number(
    value || 0
  ).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )
}

function getErrorMessage(
  error,
  fallback
) {
  return (
    error.response?.data
      ?.message ||
    fallback
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M16 3v4M8 3v4M3 10h18" />
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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path d="M4 21c1.5-5 14.5-5 16 0" />
    </svg>
  )
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M15 8.5c-.8-.8-1.8-1.2-3-1.2-1.7 0-3 .9-3 2.2 0 3.5 6 1.5 6 5 0 1.3-1.3 2.2-3 2.2-1.2 0-2.4-.4-3.2-1.3M12 5v14" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="m8 12 2.5 2.5L16 9" />
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

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m4 16-.5 4.5L8 20l11-11-4-4L4 16Z" />

      <path d="m13.5 6.5 4 4" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
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

export default AppointmentPage