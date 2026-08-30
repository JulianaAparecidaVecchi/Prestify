import { useState } from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import authService from '../../services/authService'

import BrandLogo from '../../components/BrandLogo'

import './PasswordRecovery.css'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const email =
    location.state?.email || ''

  const [token, setToken] =
    useState('')

  const [
    newPassword,
    setNewPassword,
  ] = useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState(false)

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    setError('')

    if (!token.trim()) {
      setError(
        'Informe o token de recuperação.'
      )

      return
    }

    if (!newPassword) {
      setError(
        'Informe a nova senha.'
      )

      return
    }

    if (
      newPassword.length < 8 ||
      newPassword.length > 100
    ) {
      setError(
        'A senha deve possuir entre 8 e 100 caracteres.'
      )

      return
    }

    if (!confirmPassword) {
      setError(
        'Confirme a nova senha.'
      )

      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        'As senhas não coincidem.'
      )

      return
    }

    try {
      setLoading(true)

      await authService.resetPassword(
        token.trim(),
        newPassword,
        confirmPassword
      )

      setSuccess(true)
    } catch (error) {
      const message =
        error.response?.data
          ?.message ||
        'Não foi possível redefinir a senha.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
          >
            <BrandLogo variant="recovery" />
          </button>

          <div className="recovery-card">
            <div className="recovery-icon recovery-icon-success">
              <CheckIcon />
            </div>

            <div className="recovery-header">
              <h1>
                Senha alterada
              </h1>

              <p>
                Sua senha foi redefinida
                com sucesso. Agora você
                pode entrar no Prestify
                usando a nova senha.
              </p>
            </div>

            <button
              type="button"
              className="recovery-primary-button"
              onClick={() =>
                navigate('/login', {
                  replace: true,
                })
              }
            >
              Ir para o login
            </button>
          </div>
        </section>
      </main>
    )
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
        >
          <BrandLogo variant="recovery" />
        </button>

        <div className="recovery-card">
          <div className="recovery-icon">
            <LockIcon />
          </div>

          <div className="recovery-header">
            <h1>
              Criar nova senha
            </h1>

            <p>
              Informe o token de
              recuperação e escolha sua
              nova senha.
            </p>

            {email && (
              <span className="recovery-email">
                Recuperação solicitada
                para {email}
              </span>
            )}
          </div>

          <form
            className="recovery-form"
            onSubmit={handleSubmit}
          >
            <div className="recovery-field">
              <label htmlFor="token">
                Token de recuperação
              </label>

              <div className="recovery-input-wrapper">
                <KeyIcon />

                <input
                  id="token"
                  type="text"
                  placeholder="Cole o token aqui"
                  value={token}
                  onChange={(event) =>
                    setToken(
                      event.target.value
                    )
                  }
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="recovery-field">
              <label htmlFor="newPassword">
                Nova senha
              </label>

              <div className="recovery-input-wrapper">
                <LockIcon />

                <input
                  id="newPassword"
                  type={
                    showNewPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="recovery-show-password"
                  onClick={() =>
                    setShowNewPassword(
                      (current) =>
                        !current
                    )
                  }
                >
                  <EyeIcon />
                </button>
              </div>

              <span className="recovery-field-hint">
                Entre 8 e 100 caracteres.
              </span>
            </div>

            <div className="recovery-field">
              <label htmlFor="confirmPassword">
                Confirmar nova senha
              </label>

              <div className="recovery-input-wrapper">
                <LockIcon />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Digite a senha novamente"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="recovery-show-password"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                >
                  <EyeIcon />
                </button>
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
                ? 'Alterando senha...'
                : 'Alterar senha'}
            </button>
          </form>

          <button
            type="button"
            className="recovery-back-button"
            onClick={() =>
              navigate(
                '/forgot-password'
              )
            }
          >
            <ArrowLeftIcon />

            Voltar
          </button>
        </div>
      </section>
    </main>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="8"
        cy="15"
        r="4"
      />
      <path d="m11 12 8-8" />
      <path d="m15 8 2 2" />
      <path d="m17 6 2 2" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
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

export default ResetPasswordPage