# 🟣 Prestify

O **Prestify** é um sistema ERP desenvolvido para auxiliar pequenos e médios negócios de prestação de serviços na organização e gestão de suas atividades.

O sistema centraliza diferentes áreas do estabelecimento em uma única plataforma, permitindo gerenciar agendamentos, clientes, serviços, produtos, estoque, fornecedores, finanças e usuários.

O Prestify foi desenvolvido com uma arquitetura multiempresa, permitindo que diferentes estabelecimentos utilizem o sistema de forma independente, mantendo seus dados e configurações separados.

---

## 🚀 Objetivo e Funcionalidades

O Prestify tem como objetivo facilitar a administração de negócios de prestação de serviços, reduzindo a necessidade de utilizar diferentes ferramentas para controlar as atividades do estabelecimento.

O sistema oferece as seguintes funcionalidades:

- Gerenciamento de agenda e agendamentos
- Cadastro e gerenciamento de clientes
- Cadastro de serviços
- Cadastro de produtos
- Controle de estoque
- Gerenciamento de fornecedores
- Controle financeiro de receitas e despesas
- Relatórios gerenciais
- Gerenciamento de usuários e permissões
- Configuração dos módulos utilizados pela empresa
- Gerenciamento de planos e assinaturas

---

## 🧠 Arquitetura do Sistema

O Prestify utiliza uma arquitetura **cliente-servidor**, separando a aplicação em frontend, backend e banco de dados.

1. **Frontend:**
   Desenvolvido em React, é responsável pela interface utilizada pelos usuários e pela comunicação com a API do sistema.

2. **Backend:**
   Desenvolvido em Java com Spring Boot, concentra as regras de negócio, autenticação, controle de permissões e processamento das requisições.

3. **API REST:**
   Realiza a comunicação entre frontend e backend através de requisições HTTP.

4. **Banco de Dados:**
   Utiliza MySQL/MariaDB para armazenar empresas, usuários, clientes, serviços, produtos, movimentações financeiras e demais informações do sistema.

5. **Arquitetura Multiempresa:**
   O sistema permite que várias empresas utilizem a mesma aplicação, mantendo os dados de cada estabelecimento isolados.

---

## 🛠️ Tecnologias Utilizadas

| **Categoria** | **Tecnologias** |
| --- | --- |
| **Frontend** | React, Vite, React Router, Axios, Recharts, JavaScript, CSS |
| **Backend** | Java, Spring Boot, Spring Security, Spring Data JPA, Maven |
| **Banco de Dados** | MySQL / MariaDB |
| **Autenticação** | JWT |
| **Arquitetura** | API REST, Multi-tenant |
| **Ferramentas** | Git, GitHub, Visual Studio Code, XAMPP |

---

## 📦 Módulos do Sistema

O Prestify possui uma estrutura modular que permite disponibilizar diferentes funcionalidades de acordo com o plano da empresa.

- Agenda
- Clientes
- Serviços
- Produtos
- Estoque
- Fornecedores
- Financeiro
- Relatórios
- Usuários
- Configurações

O módulo de **Serviços** é obrigatório, enquanto os demais módulos disponíveis dependem do plano contratado pela empresa.

---

## 🔐 Perfis de Acesso

O sistema possui diferentes níveis de acesso para controlar as funcionalidades disponíveis para cada usuário:

- **SUPER_ADMIN:** responsável pela administração geral da plataforma Prestify.
- **OWNER:** proprietário da empresa e responsável pelas principais configurações.
- **ADMIN:** administrador interno da empresa.
- **MANAGER:** responsável por atividades de gerenciamento operacional.
- **EMPLOYEE:** usuário com acesso às funcionalidades operacionais permitidas.

As permissões são verificadas pelo backend para impedir o acesso não autorizado às funcionalidades do sistema.

---

## 💳 Planos

O Prestify possui três planos principais:

| **Plano** | **Mensal** | **Anual** | **Usuários** |
| --- | ---: | ---: | ---: |
| Basic | R$ 49,90 | R$ 499 | Até 3 |
| Pro | R$ 99,90 | R$ 999 | Até 10 |
| Premium | R$ 159,90 | R$ 1.599 | Ilimitados |

Cada plano determina quais módulos podem ser utilizados pela empresa.

---

## 🧪 Testes Realizados

Durante o desenvolvimento foram realizados testes para validar os principais fluxos e regras de negócio do sistema, incluindo:

- Autenticação e controle de sessão
- Controle de permissões por perfil
- Isolamento de dados entre empresas
- Cadastro e gerenciamento de clientes
- Cadastro e gerenciamento de serviços
- Produtos e movimentações de estoque
- Fornecedores
- Lançamentos financeiros
- Gerenciamento de usuários
- Regras de módulos e planos
- Exportação de dados em CSV e PDF
- Suspensão de empresas e invalidação de sessões

Também foi executado um **smoke test integrado**, responsável por validar os principais endpoints e fluxos do backend.

### Resultado

```text
62 testes aprovados
0 falhas
0 ignorados

RESULTADO: APROVADO
```

---

## ▶️ Execução do Projeto

### Backend

```powershell
cd prestify-backend
.\mvnw.cmd spring-boot:run
```

O backend será executado em:

```text
http://localhost:8080
```

### Frontend

Em outro terminal:

```powershell
cd prestify-frontend
npm.cmd install
npm.cmd run dev
```

O frontend será executado em:

```text
http://localhost:5173
```

Para executar o sistema localmente, é necessário possuir o MySQL/MariaDB em execução e um banco chamado `prestify`.

---

## 👥 Integrantes da Equipe

Este projeto foi desenvolvido por:

- Arthur Rodrigues Pansera
- Jean Inácio Praes
- Juliana Aparecida Vecchi
- Stefany Carlos de Oliveira