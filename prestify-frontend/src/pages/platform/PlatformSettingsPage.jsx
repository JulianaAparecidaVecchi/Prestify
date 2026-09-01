import {
  useEffect,
  useState,
} from 'react'

import platformSettingsService
  from '../../services/platformSettingsService'

import './PlatformSettingsPage.css'

const initialForm = {
  platformName: 'Prestify',
  supportEmail: '',
  supportPhone: '',
  websiteUrl: '',
  defaultTimezone:
    'America/Sao_Paulo',
  defaultCurrency: 'BRL',
  allowOrganizationRegistration:
    true,
  maintenanceMode: false,
}

function PlatformSettingsPage() {
  const [
    form,
    setForm,
  ] = useState(
    initialForm
  )

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
    fieldErrors,
    setFieldErrors,
  ] = useState({})

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings =
    async () => {
      setLoading(true)
      setError('')

      try {
        const data =
          await platformSettingsService
            .getSettings()

        setForm({
          platformName:
            data.platformName ||
            'Prestify',

          supportEmail:
            data.supportEmail ||
            '',

          supportPhone:
            data.supportPhone ||
            '',

          websiteUrl:
            data.websiteUrl ||
            '',

          defaultTimezone:
            data.defaultTimezone ||
            'America/Sao_Paulo',

          defaultCurrency:
            data.defaultCurrency ||
            'BRL',

          allowOrganizationRegistration:
            data.allowOrganizationRegistration ??
            true,

          maintenanceMode:
            data.maintenanceMode ??
            false,
        })

        setLastUpdated(
          data.updatedAt || null
        )
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            'Não foi possível carregar as configurações da plataforma.'
          )
        )
      } finally {
        setLoading(false)
      }
    }

  const handleChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target

      setForm(
        (current) => ({
          ...current,

          [name]:
            type === 'checkbox'
              ? checked
              : value,
        })
      )

      setFieldErrors(
        (current) => ({
          ...current,
          [name]: '',
        })
      )

      setSuccess('')
    }

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      setError('')
      setSuccess('')

      const validationErrors =
        validateForm(form)

      setFieldErrors(
        validationErrors
      )

      if (
        Object.keys(
          validationErrors
        ).length > 0
      ) {
        return
      }

      setSaving(true)

      try {
        const data =
          await platformSettingsService
            .updateSettings({
              platformName:
                form.platformName
                  .trim(),

              supportEmail:
                normalizeOptional(
                  form.supportEmail
                ),

              supportPhone:
                normalizeOptional(
                  form.supportPhone
                ),

              websiteUrl:
                normalizeOptional(
                  form.websiteUrl
                ),

              defaultTimezone:
                form.defaultTimezone
                  .trim(),

              defaultCurrency:
                form.defaultCurrency
                  .trim()
                  .toUpperCase(),

              allowOrganizationRegistration:
                form
                  .allowOrganizationRegistration,

              maintenanceMode:
                form
                  .maintenanceMode,
            })

        setForm({
          platformName:
            data.platformName ||
            'Prestify',

          supportEmail:
            data.supportEmail ||
            '',

          supportPhone:
            data.supportPhone ||
            '',

          websiteUrl:
            data.websiteUrl ||
            '',

          defaultTimezone:
            data.defaultTimezone ||
            'America/Sao_Paulo',

          defaultCurrency:
            data.defaultCurrency ||
            'BRL',

          allowOrganizationRegistration:
            data.allowOrganizationRegistration ??
            true,

          maintenanceMode:
            data.maintenanceMode ??
            false,
        })

        setLastUpdated(
          data.updatedAt || null
        )

        setSuccess(
          'Configurações da plataforma salvas com sucesso.'
        )
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            'Não foi possível salvar as configurações da plataforma.'
          )
        )
      } finally {
        setSaving(false)
      }
    }

  if (loading) {
    return (
      <div className="platform-settings-page">
        <div className="platform-settings-loading">
          <div className="platform-settings-spinner" />

          <strong>
            Carregando configurações
          </strong>

          <span>
            Aguarde enquanto buscamos
            os dados da plataforma.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="platform-settings-page">
      <div className="platform-settings-heading">
        <div>
          <h2>
            Configurações da Plataforma
          </h2>

          <p>
            Defina informações globais,
            padrões e parâmetros
            administrativos do Prestify.
          </p>
        </div>

        {lastUpdated && (
          <div className="platform-settings-updated">
            <span>
              Última atualização
            </span>

            <strong>
              {formatDateTime(
                lastUpdated
              )}
            </strong>
          </div>
        )}
      </div>

      {error && (
        <div className="platform-settings-alert platform-settings-alert-error">
          <AlertIcon />

          <span>
            {error}
          </span>
        </div>
      )}

      {success && (
        <div className="platform-settings-alert platform-settings-alert-success">
          <CheckIcon />

          <span>
            {success}
          </span>
        </div>
      )}

      <form
        className="platform-settings-form"
        onSubmit={
          handleSubmit
        }
      >
        <section className="platform-settings-card">
          <div className="platform-settings-card-header">
            <div className="platform-settings-card-icon">
              <BuildingIcon />
            </div>

            <div>
              <h3>
                Dados da plataforma
              </h3>

              <p>
                Informações institucionais
                utilizadas na administração
                do Prestify.
              </p>
            </div>
          </div>

          <div className="platform-settings-grid">
            <div className="platform-settings-field platform-settings-field-full">
              <label
                htmlFor="platformName"
              >
                Nome da plataforma
              </label>

              <input
                id="platformName"
                name="platformName"
                type="text"
                maxLength="120"
                value={
                  form.platformName
                }
                onChange={
                  handleChange
                }
                placeholder="Prestify"
                className={
                  fieldErrors
                    .platformName
                    ? 'platform-settings-input-error'
                    : ''
                }
              />

              {fieldErrors
                .platformName && (
                <span className="platform-settings-field-error">
                  {
                    fieldErrors
                      .platformName
                  }
                </span>
              )}
            </div>

            <div className="platform-settings-field">
              <label
                htmlFor="websiteUrl"
              >
                Site
              </label>

              <input
                id="websiteUrl"
                name="websiteUrl"
                type="text"
                maxLength="250"
                value={
                  form.websiteUrl
                }
                onChange={
                  handleChange
                }
                placeholder="https://prestify.com.br"
                className={
                  fieldErrors
                    .websiteUrl
                    ? 'platform-settings-input-error'
                    : ''
                }
              />

              {fieldErrors
                .websiteUrl && (
                <span className="platform-settings-field-error">
                  {
                    fieldErrors
                      .websiteUrl
                  }
                </span>
              )}
            </div>

            <div className="platform-settings-field">
              <label
                htmlFor="supportEmail"
              >
                E-mail de suporte
              </label>

              <input
                id="supportEmail"
                name="supportEmail"
                type="email"
                maxLength="150"
                value={
                  form.supportEmail
                }
                onChange={
                  handleChange
                }
                placeholder="suporte@prestify.com"
                className={
                  fieldErrors
                    .supportEmail
                    ? 'platform-settings-input-error'
                    : ''
                }
              />

              {fieldErrors
                .supportEmail && (
                <span className="platform-settings-field-error">
                  {
                    fieldErrors
                      .supportEmail
                  }
                </span>
              )}
            </div>

            <div className="platform-settings-field">
              <label
                htmlFor="supportPhone"
              >
                Telefone / WhatsApp
              </label>

              <input
                id="supportPhone"
                name="supportPhone"
                type="text"
                maxLength="30"
                value={
                  form.supportPhone
                }
                onChange={
                  handleChange
                }
                placeholder="+55 41 99999-9999"
              />
            </div>
          </div>
        </section>

        <section className="platform-settings-card">
          <div className="platform-settings-card-header">
            <div className="platform-settings-card-icon">
              <GlobeIcon />
            </div>

            <div>
              <h3>
                Padrões do sistema
              </h3>

              <p>
                Valores globais utilizados
                como referência pela
                plataforma.
              </p>
            </div>
          </div>

          <div className="platform-settings-grid">
            <div className="platform-settings-field">
              <label
                htmlFor="defaultTimezone"
              >
                Fuso horário padrão
              </label>

              <select
                id="defaultTimezone"
                name="defaultTimezone"
                value={
                  form.defaultTimezone
                }
                onChange={
                  handleChange
                }
              >
                <option value="America/Sao_Paulo">
                  America/Sao_Paulo
                </option>

                <option value="America/Manaus">
                  America/Manaus
                </option>

                <option value="America/Cuiaba">
                  America/Cuiaba
                </option>

                <option value="America/Recife">
                  America/Recife
                </option>

                <option value="America/Fortaleza">
                  America/Fortaleza
                </option>

                <option value="UTC">
                  UTC
                </option>
              </select>

              {fieldErrors
                .defaultTimezone && (
                <span className="platform-settings-field-error">
                  {
                    fieldErrors
                      .defaultTimezone
                  }
                </span>
              )}
            </div>

            <div className="platform-settings-field">
              <label
                htmlFor="defaultCurrency"
              >
                Moeda padrão
              </label>

              <select
                id="defaultCurrency"
                name="defaultCurrency"
                value={
                  form.defaultCurrency
                }
                onChange={
                  handleChange
                }
              >
                <option value="BRL">
                  BRL - Real brasileiro
                </option>

                <option value="USD">
                  USD - Dólar americano
                </option>

                <option value="EUR">
                  EUR - Euro
                </option>
              </select>

              {fieldErrors
                .defaultCurrency && (
                <span className="platform-settings-field-error">
                  {
                    fieldErrors
                      .defaultCurrency
                  }
                </span>
              )}
            </div>
          </div>

          <div className="platform-settings-info">
            <InfoIcon />

            <p>
              Estes valores representam
              padrões globais. As empresas
              que já possuem configurações
              próprias continuam utilizando
              seus próprios valores.
            </p>
          </div>
        </section>

        <section className="platform-settings-card">
          <div className="platform-settings-card-header">
            <div className="platform-settings-card-icon">
              <ControlIcon />
            </div>

            <div>
              <h3>
                Controle da plataforma
              </h3>

              <p>
                Parâmetros administrativos
                para controlar o
                funcionamento do sistema.
              </p>
            </div>
          </div>

          <div className="platform-settings-switch-list">
            <div className="platform-settings-switch-row">
              <div className="platform-settings-switch-content">
                <strong>
                  Permitir cadastro de
                  novas empresas
                </strong>

                <p>
                  Define se novos clientes
                  poderão criar empresas
                  na plataforma quando o
                  fluxo de cadastro público
                  estiver disponível.
                </p>
              </div>

              <label className="platform-settings-switch">
                <input
                  type="checkbox"
                  name="allowOrganizationRegistration"
                  checked={
                    form
                      .allowOrganizationRegistration
                  }
                  onChange={
                    handleChange
                  }
                />

                <span className="platform-settings-switch-slider" />
              </label>
            </div>

            <div className="platform-settings-switch-divider" />

            <div className="platform-settings-switch-row">
              <div className="platform-settings-switch-content">
                <div className="platform-settings-maintenance-title">
                  <strong>
                    Modo de manutenção
                  </strong>

                  {form
                    .maintenanceMode && (
                    <span>
                      ATIVO
                    </span>
                  )}
                </div>

                <p>
                  Deixa registrado que a
                  plataforma está em modo
                  de manutenção. O bloqueio
                  efetivo dos usuários será
                  conectado a esta opção em
                  uma etapa posterior.
                </p>
              </div>

              <label className="platform-settings-switch platform-settings-switch-danger">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={
                    form
                      .maintenanceMode
                  }
                  onChange={
                    handleChange
                  }
                />

                <span className="platform-settings-switch-slider" />
              </label>
            </div>
          </div>
        </section>

        <div className="platform-settings-warning">
          <ShieldIcon />

          <div>
            <strong>
              Configurações administrativas
            </strong>

            <p>
              Estas opções são globais e
              somente usuários com perfil
              SUPER_ADMIN podem
              modificá-las.
            </p>
          </div>
        </div>

        <div className="platform-settings-actions">
          <button
            type="button"
            className="platform-settings-secondary-button"
            onClick={
              loadSettings
            }
            disabled={
              saving
            }
          >
            Descartar alterações
          </button>

          <button
            type="submit"
            className="platform-settings-primary-button"
            disabled={
              saving
            }
          >
            {saving
              ? 'Salvando...'
              : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}

function validateForm(
  values
) {
  const errors = {}

  if (
    !values.platformName
      .trim()
  ) {
    errors.platformName =
      'Informe o nome da plataforma.'
  } else if (
    values.platformName
      .trim()
      .length > 120
  ) {
    errors.platformName =
      'O nome deve possuir no máximo 120 caracteres.'
  }

  if (
    values.supportEmail &&
    !isValidEmail(
      values.supportEmail
    )
  ) {
    errors.supportEmail =
      'Informe um e-mail válido.'
  }

  if (
    values.supportEmail
      .trim()
      .length > 150
  ) {
    errors.supportEmail =
      'O e-mail deve possuir no máximo 150 caracteres.'
  }

  if (
    values.websiteUrl &&
    !isValidWebsiteUrl(
      values.websiteUrl
    )
  ) {
    errors.websiteUrl =
      'Informe uma URL iniciando com http:// ou https://.'
  }

  if (
    !values.defaultTimezone
  ) {
    errors.defaultTimezone =
      'Informe o fuso horário.'
  }

  if (
    !values.defaultCurrency
  ) {
    errors.defaultCurrency =
      'Informe a moeda padrão.'
  }

  return errors
}

function normalizeOptional(
  value
) {
  const normalized =
    value?.trim()

  return normalized
    ? normalized
    : null
}

function isValidEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  )
}

function isValidWebsiteUrl(
  value
) {
  try {
    const url =
      new URL(
        value.trim()
      )

    return (
      url.protocol ===
        'http:' ||
      url.protocol ===
        'https:'
    )
  } catch {
    return false
  }
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

function getErrorMessage(
  error,
  fallback
) {
  const responseData =
    error.response?.data

  if (
    typeof responseData ===
    'string'
  ) {
    return responseData
  }

  if (
    responseData?.message
  ) {
    return responseData.message
  }

  if (
    responseData?.error
  ) {
    return responseData.error
  }

  if (
    responseData &&
    typeof responseData ===
      'object'
  ) {
    const validationMessage =
      Object.values(
        responseData
      ).find(
        (value) =>
          typeof value ===
          'string'
      )

    if (validationMessage) {
      return validationMessage
    }
  }

  return fallback
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 21V5l7-3 7 3v16M3 21h18M9 8h2M14 8h2M9 12h2M14 12h2M9 16h2M14 16h2" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M3 12h18M12 3c2.7 2.6 4 5.6 4 9s-1.3 6.4-4 9M12 3c-2.7 2.6-4 5.6-4 9s1.3 6.4 4 9" />
    </svg>
  )
}

function ControlIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5" />

      <circle
        cx="16"
        cy="6"
        r="2"
      />

      <circle
        cx="8"
        cy="12"
        r="2"
      />

      <circle
        cx="13"
        cy="18"
        r="2"
      />
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2 20 5v6c0 5.4-3.3 9.4-8 11-4.7-1.6-8-5.6-8-11V5l8-3Z" />

      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 2 21h20L12 3Z" />

      <path d="M12 9v5M12 18h.01" />
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

export default PlatformSettingsPage