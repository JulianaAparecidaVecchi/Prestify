import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import './ModulePlaceholderPage.css'

const modules = {
  '/agenda': {
    title: 'Agenda',
    description:
      'Gerenciamento de agendamentos e atendimentos.',
  },
  '/clientes': {
    title: 'Clientes',
    description:
      'Cadastro e gerenciamento dos clientes.',
  },
  '/servicos': {
    title: 'Serviços',
    description:
      'Cadastro dos serviços oferecidos pela organização.',
  },
  '/produtos': {
    title: 'Produtos',
    description:
      'Gerenciamento dos produtos comercializados.',
  },
  '/estoque': {
    title: 'Estoque',
    description:
      'Controle de entradas, saídas e quantidades em estoque.',
  },
  '/fornecedores': {
    title: 'Fornecedores',
    description:
      'Cadastro e gerenciamento de fornecedores.',
  },
  '/financeiro': {
    title: 'Financeiro',
    description:
      'Controle financeiro da organização.',
  },
  '/relatorios': {
    title: 'Relatórios',
    description:
      'Indicadores e informações gerenciais.',
  },
  '/usuarios': {
    title: 'Usuários',
    description:
      'Gerenciamento dos usuários e acessos ao sistema.',
  },
  '/configuracoes': {
    title: 'Configurações',
    description:
      'Configurações gerais e módulos do Prestify.',
  },
}

function ModulePlaceholderPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const module =
    modules[location.pathname] || {
      title: 'Módulo',
      description:
        'Este módulo será implementado.',
    }

  return (
    <div className="module-placeholder">
      <div className="module-placeholder-icon">
        <ConstructionIcon />
      </div>

      <h2>{module.title}</h2>

      <p>
        {module.description}
      </p>

      <span>
        A estrutura está pronta. Esta
        funcionalidade será implementada
        nas próximas etapas.
      </span>

      <button
        type="button"
        onClick={() =>
          navigate('/dashboard')
        }
      >
        Voltar ao Dashboard
      </button>
    </div>
  )
}

function ConstructionIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 20h16M6 20l3-16h6l3 16M8 10h8M7 15h10" />
    </svg>
  )
}

export default ModulePlaceholderPage