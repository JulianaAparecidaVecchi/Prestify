import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import authService from '../../services/authService'

import BrandLogo from '../../components/BrandLogo'

import './PasswordRecovery.css'

function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError(
        'Informe seu e-mail.'
      )

      return
    }

    try {
      setLoading(true)

      const data =
        await authService.forgotPassword(
          email.trim()
        )

      setSuccess(
        data?.message ||
          'Solicitação realizada com sucesso.'
      )
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Não foi possível solicitar a recuperação da senha.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/reset-password', {
      state: {
        email: email.trim(),
      },
    })
  }

  return (
    <main className="recovery-page">
      <div className="recovery-decoration recovery-decoration-one" />

      <div className="recovery-decoration recovery-decoration-two" />

      <section className="recovery-container">
        <button
          type="button"
          className="recovery-brand"
          onClick={() =>
            navigate('/login')
          }
          aria-label="Voltar ao login"
        >
          <BrandLogo variant="recovery" />
        </button>

        <div className="recovery-card">
          {!success ? (
            <>
              <div className="recovery-icon">
                <EmailIcon />
              </div>

              <div className="recovery-header">
                <h1>
                  Esqueceu sua senha?
                </h1>

                <p>
                  Informe o e-mail
                  cadastrado na sua conta
                  para iniciar a recuperação
                  da senha.
                </p>
              </div>

              <form
                className="recovery-form"
                onSubmit={handleSubmit}
              >
                <div className="recovery-field">
                  <label htmlFor="email">
                    E-mail
                  </label>

                  <div className="recovery-input-wrapper">
                    <EmailIcon />

                    <input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className="recovery-message recovery-message-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="recovery-primary-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Enviando...'
                    : 'Recuperar senha'}
                </button>
              </form>

              <button
                type="button"
                className="recovery-back-button"
                onClick={() =>
                  navigate('/login')
                }
              >
                <ArrowLeftIcon />

                Voltar para o login
              </button>
            </>
          ) : (
            <>
              <div className="recovery-icon recovery-icon-success">
                <CheckIcon />
              </div>

              <div className="recovery-header">
                <h1>
                  Solicitação realizada
                </h1>

                <p>
                  {success}
                </p>
              </div>

              <div className="recovery-development-info">
                <strong>
                  Ambiente de desenvolvimento
                </strong>

                <p>
                  Como o envio de e-mail
                  ainda não está configurado,
                  copie o token de recuperação
                  exibido no terminal do
                  Spring Boot.
                </p>
              </div>

              <button
                type="button"
                className="recovery-primary-button"
                onClick={handleContinue}
              >
                Informar token
              </button>

              <button
                type="button"
                className="recovery-back-button"
                onClick={() => {
                  setSuccess('')
                  setError('')
                }}
              >
                Solicitar novamente
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
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

export default ForgotPasswordPage