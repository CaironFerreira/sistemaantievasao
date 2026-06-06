# Constitution — Sistema de Gestão de Permanência Estudantil

## 1. Produto

O sistema será uma aplicação web para monitorar indicadores acadêmicos, classificar risco de evasão, gerar alertas priorizados, registrar acompanhamentos institucionais e apoiar decisões por meio de relatórios gerenciais.

O MVP deve entregar uma solução funcional, simples e orientada à ação, sem modelos avançados de IA e sem integrações complexas com múltiplos sistemas.

## 2. Stack obrigatória da V1

### 2.1 Frontend e Backend

- Framework principal: **Next.js com App Router**.
- Linguagem: **TypeScript**.
- Renderização: combinação de Server Components, Client Components e Server Actions quando aplicável.
- API interna: Route Handlers do Next.js para endpoints de importação, relatórios e operações assíncronas simples.

### 2.2 Interface

- UI: **shadcn/ui**.
- Estilização: **Tailwind CSS**.
- Formulários: **React Hook Form + Zod**.
- Tabelas: TanStack Table quando houver necessidade de filtros, ordenação e paginação.
- Gráficos: Recharts.

### 2.3 Banco de Dados

- Banco: **PostgreSQL**.
- ORM: **Prisma**.
- Migrações: Prisma Migrate.
- Ambiente local: Docker Compose com PostgreSQL.

### 2.4 Autenticação e Autorização

- Autenticação: **Auth.js** ou mecanismo equivalente compatível com Next.js.
- Autorização: RBAC com perfis mínimos:
  - `ADMIN`: gestão de usuários, cursos, turmas, regras e parâmetros globais.
  - `GESTOR`: visualização gerencial, relatórios e acompanhamento amplo.
  - `ACOMPANHAMENTO`: atuação sobre alertas, registro de intervenções e evolução dos casos.
  - `LEITURA`: acesso somente leitura a relatórios e indicadores permitidos.

### 2.5 Importação de Dados

- MVP deve suportar importação via CSV e cadastro manual básico.
- Formatos aceitos inicialmente: `.csv`.
- Validação de colunas obrigatórias antes de persistir dados.
- Registros inválidos devem ser rejeitados com relatório de erros.

### 2.6 Segurança e LGPD

- Dados pessoais e acadêmicos dos alunos são sensíveis.
- Toda rota administrativa deve exigir autenticação.
- Acesso aos dados deve respeitar perfil do usuário.
- Logs não devem expor dados pessoais desnecessários.
- O sistema deve registrar auditoria mínima para ações relevantes:
  - importação de dados;
  - alteração de regra de risco;
  - criação/edição de acompanhamento;
  - alteração de status de caso.

### 2.7 Regras de Risco

- O MVP usará regras configuráveis, não IA avançada.
- A classificação mínima deve contemplar:
  - alto risco;
  - médio risco;
  - baixo risco.
- As regras devem poder considerar:
  - frequência;
  - notas;
  - entregas/atividades;
  - combinação ponderada desses indicadores.

### 2.8 Qualidade de Código

- Código modular por domínio funcional.
- Separação mínima entre:
  - camada de apresentação;
  - validações;
  - serviços de domínio;
  - acesso ao banco;
  - cálculo de risco;
  - geração de relatórios.
- Toda regra de risco deve ter teste unitário.
- Todo fluxo crítico deve ter teste de integração ou e2e mínimo.

### 2.9 Testes

- Testes unitários: Vitest.
- Testes de componentes: React Testing Library.
- Testes e2e: Playwright.
- Cobertura obrigatória para:
  - cálculo de risco;
  - geração de alertas;
  - transição de status;
  - validação de importação CSV;
  - permissões por perfil.

### 2.10 Performance

- Consultas de listagem devem usar paginação.
- Relatórios devem usar filtros obrigatórios quando o volume for alto.
- Índices devem ser criados para campos de consulta frequente:
  - aluno;
  - turma;
  - curso;
  - período;
  - nível de risco;
  - status do caso.

### 2.11 Escalabilidade

- A modelagem deve permitir múltiplas unidades institucionais no futuro.
- O MVP pode iniciar com uma unidade piloto, mas o schema não deve impedir expansão.

### 2.12 Restrições do MVP

O MVP não deve incluir:

- modelos avançados de IA;
- predição estatística sofisticada;
- integração obrigatória com sistemas acadêmicos externos;
- LMS;
- base institucional externa automatizada;
- aplicativo mobile nativo.

### 2.13 Critérios de Aceitação Arquitetural

A implementação só é considerada compatível com esta Constituição se:

1. houver autenticação e controle de acesso por perfil;
2. houver persistência relacional em PostgreSQL;
3. houver classificação de todos os alunos monitorados;
4. houver regras de risco configuráveis;
5. houver alertas priorizados;
6. houver registro de acompanhamento e status do caso;
7. houver relatórios por aluno, turma, curso e período;
8. houver tratamento mínimo de LGPD;
9. houver testes para regras de risco e fluxos críticos.
