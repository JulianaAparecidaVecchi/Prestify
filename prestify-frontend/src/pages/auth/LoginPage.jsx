import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import authService from '../../services/authService'

import BrandLogo from '../../components/BrandLogo'

import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [
    rememberMe,
    setRememberMe,
  ] = useState(true)

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [error, setError] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    setError('')

    if (!email.trim()) {
      setError(
        'Informe seu e-mail.'
      )

      return
    }

    if (!password) {
      setError(
        'Informe sua senha.'
      )

      return
    }

    try {
      setLoading(true)

      const data =
        await authService.login(
          email.trim(),
          password
        )

      authService.saveSession(
        data,
        rememberMe
      )

      navigate('/dashboard', {
        replace: true,
      })
    } catch (error) {
      const message =
        error.response?.data
          ?.message ||
        'Não foi possível realizar o login.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleContactTeam = () => {
    const phone =
      import.meta.env
        .VITE_WHATSAPP_NUMBER

    if (
      !phone ||
      phone.includes(
        'SEUNUMERO'
      )
    ) {
      alert(
        'O número de WhatsApp do Prestify ainda não foi configurado.'
      )

      return
    }

    const message =
      'Olá! Tenho interesse em conhecer o Prestify e gostaria de saber mais sobre os planos.'

    const url =
      `https://wa.me/${phone}` +
      `?text=${encodeURIComponent(
        message
      )}`

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div className="login-page">
      <div className="login-decoration login-decoration-one" />

      <div className="login-decoration login-decoration-two" />

      <section className="login-presentation">
        <div className="login-logo">
          <BrandLogo variant="login" />
        </div>

        <div className="login-presentation-content">
          <h1>
            Simplifique a gestão do seu
            negócio de serviços.
          </h1>

          <div className="login-benefits">
            <div className="login-benefit">
              <div className="login-benefit-icon">
                <CalendarIcon />
              </div>

              <div>
                <strong>
                  Mais produtividade no
                  dia a dia
                </strong>

                <p>
                  Agendamentos,
                  atendimentos e tarefas
                  organizados em um só
                  lugar.
                </p>
              </div>
            </div>

            <div className="login-benefit">
              <div className="login-benefit-icon">
                <UsersIcon />
              </div>

              <div>
                <strong>
                  Informações
                  centralizadas
                </strong>

                <p>
                  Tenha todos os dados do
                  seu negócio sempre à
                  mão.
                </p>
              </div>
            </div>

            <div className="login-benefit">
              <div className="login-benefit-icon">
                <ChartIcon />
              </div>

              <div>
                <strong>
                  Relatórios para
                  melhores decisões
                </strong>

                <p>
                  Acompanhe indicadores e
                  tome decisões com base
                  em dados reais.
                </p>
              </div>
            </div>

            <div className="login-benefit">
              <div className="login-benefit-icon">
                <ShieldIcon />
              </div>

              <div>
                <strong>
                  Segurança e
                  confiabilidade
                </strong>

                <p>
                  Seus dados protegidos
                  com tecnologia e boas
                  práticas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-security-message">
          <ShieldIcon />

          <span>
            Seus dados protegidos com
            segurança
          </span>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-card">
          <div className="login-card-header">
            <h2>
              Bem-vindo de volta!
            </h2>

            <p>
              Faça login para acessar
              sua conta
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="login-field">
              <label htmlFor="email">
                E-mail
              </label>

              <div className="login-input-wrapper">
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

            <div className="login-field">
              <label htmlFor="password">
                Senha
              </label>

              <div className="login-input-wrapper">
                <LockIcon />

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  className="login-show-password"
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  }
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={(event) =>
                    setRememberMe(
                      event.target
                        .checked
                    )
                  }
                  disabled={loading}
                />

                <span>
                  Lembrar de mim
                </span>
              </label>

              <button
                className="login-forgot-password"
                type="button"
                onClick={() =>
                  navigate(
                    '/forgot-password'
                  )
                }
              >
                Esqueci minha senha
              </button>
            </div>

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Entrando...'
                : 'Entrar'}
            </button>
          </form>

          <div className="login-contact">
            <span>
              Ainda não tem uma conta?
            </span>

            <button
              type="button"
              className="login-contact-button"
              onClick={
                handleContactTeam
              }
            >
              Fale com nosso time
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M7 2v3M17 2v3M3.5 9h17M5 4.5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
      <path d="M7 13h3M14 13h3M7 17h3M14 17h3" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="4" />
      <path d="M2.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6M16 5.5a3.5 3.5 0 0 1 0 7M17 14c2.7.4 4.2 2.4 4.5 5" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20V7M2 20h22" />
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

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

export default LoginPage