# tasks.md — Roadmap de Implementação

## 1. Convenções

- `[P]` indica tarefa paralelizável.
- Tarefas sem `[P]` devem respeitar dependência sequencial.
- Cada tarefa deve resultar em código, teste, documentação ou configuração verificável.
- Nenhuma funcionalidade crítica deve ser implementada sem validação no servidor.

## 2. Fase 0 — Preparação do Repositório

### [X] T001 — Inicializar projeto Next.js com TypeScript

Criar aplicação Next.js com App Router, TypeScript, ESLint e estrutura base.

### [X] T002 — Configurar Tailwind CSS e shadcn/ui

Adicionar Tailwind, configurar tema base e instalar componentes iniciais do shadcn/ui.

### [X] T003 — Configurar estrutura de pastas

Criar estrutura:

- `src/features`
- `src/components`
- `src/lib`
- `src/server`
- `src/tests`

### [X] T004 — Configurar Docker Compose com PostgreSQL

Criar `docker-compose.yml` com PostgreSQL para desenvolvimento local.

### [X] T005 — Configurar Prisma

Instalar Prisma, criar `schema.prisma`, configurar conexão e primeira migration vazia.

### [X] T006 — Configurar ferramentas de teste

Configurar Vitest, React Testing Library e Playwright.

## 3. Fase 1 — Base de Autenticação, Gestão de Usuários, Layout e Permissões

### [X] T007 — Implementar modelo User e enum Role

Criar entidade de usuário e perfis:

- ADMIN;
- GESTOR;
- ACOMPANHAMENTO;
- LEITURA.

### [X] T008 — Implementar autenticação

Configurar login, logout, sessão e proteção de rotas administrativas.

### [X] T009 — Implementar RBAC

Criar utilitário de autorização por perfil e aplicar em Server Actions/Route Handlers.

### [X] T077 — Criar modelo AuditLog

Adicionar entidade `AuditLog` e infraestrutura base de registro de ações críticas associadas a usuário, entidade, `entityId`, ação e metadados mínimos.

### [X] T010 — Criar layout base do painel

Implementar sidebar, header, área de conteúdo e navegação principal.

### [X] T011 — Criar página de login

Tela simples com validação, mensagens de erro e redirecionamento pós-login.

### [X] T012 — Criar seed inicial de usuário administrador

Adicionar script para criar usuário ADMIN inicial.

### [X] T013 — Testar permissões por perfil

Criar testes para garantir acesso e bloqueio conforme papel do usuário.

### [X] T093 — Implementar CRUD de usuários

Criar telas e ações para listar usuários com paginação server-side, criar, editar, ativar e desativar usuários.

### [X] T094 — Implementar gestão de perfis e proteção do último ADMIN

Permitir alterar perfil de acesso e impedir que o último `ADMIN` ativo perca privilégio administrativo.

### [X] T095 — Auditar alterações de usuários

Registrar criação, alteração de perfil, ativação e desativação de usuários.

### [X] T096 — Testar gestão de usuários e permissões administrativas

Validar acesso exclusivo de `ADMIN`, bloqueio de usuário desativado e proteção do último `ADMIN`.

## 4. Fase 2 — Modelagem Institucional

### [X] T014 — Criar modelos InstitutionUnit, Course e ClassGroup

Adicionar entidades no Prisma com relacionamentos.

### [X] T015 — Criar migrations e índices institucionais

Gerar migration com índices em unidade, curso, turma e período para consultas institucionais.

### [X] T016 — Implementar CRUD de unidades

Criar telas e ações para cadastrar, editar, listar com paginação server-side e desativar unidades.

### [X] T017 — Implementar CRUD de cursos

Criar telas e ações para cadastrar, editar, listar com paginação server-side e desativar cursos por unidade.

### [X] T018 — Implementar CRUD de turmas

Criar telas e ações para cadastrar, editar, listar com paginação server-side e desativar turmas por curso/período.

### [X] T019 — Criar validações Zod para unidade, curso e turma

Centralizar schemas de validação.

### [X] T020 — Testar CRUD institucional

Criar testes de criação, edição, listagem paginada e desativação.

## 5. Fase 3 — Alunos e Dados Acadêmicos

### [X] T021 — Criar modelo Student

Adicionar entidade Student com matrícula, nome, e-mail, curso, turma, status e índices de consulta por curso e turma.

### [X] T022 — Criar modelo AcademicRecord

Adicionar indicadores de frequência, nota, entregas pendentes, total de entregas, período, origem e índice por aluno/período.

### [X] T023 — Implementar CRUD de alunos

Criar telas e ações para listar alunos com paginação server-side, cadastrar, editar e desativar alunos.

### [X] T024 — Implementar cadastro manual de registro acadêmico

Permitir inserir ou editar indicadores acadêmicos de um aluno em determinado período.

### [X] T025 — Criar parser CSV

Implementar leitura de arquivo CSV com mapeamento das colunas obrigatórias.

### [X] T026 — Criar validação de importação CSV

Validar matrícula, nome, curso, turma, período, frequência, nota e entregas.

### [X] T027 — Implementar tela de importação CSV

Criar fluxo com upload, pré-validação, resumo de erros e confirmação.

### [X] T028 — Persistir importação em transação

Garantir que dados aceitos sejam salvos corretamente e erros não contaminem a base.

### [X] T029 — Criar relatório de erros da importação

Exibir registros rejeitados e motivo de rejeição.

### [X] T030 — Testar importação válida

Criar teste de importação CSV com registros corretos.

### [X] T031 — Testar importação inválida

Criar teste com erros de campos obrigatórios, valores fora de faixa e inconsistência de entregas.

## 6. Fase 4 — Regras e Classificação de Risco

### [X] T032 — Criar modelo RiskRule

Adicionar entidade com limites, pesos, período, unidade, status ativo e índice composto `(unitId, period, active)`.

### [X] T033 — Criar tela de configuração de regras de risco

Permitir criar, editar, ativar e desativar regras.

### [X] T034 — Validar consistência das regras

Garantir limites coerentes e pesos válidos.

### [X] T035 — Criar serviço de cálculo de risco

Implementar função pura para receber indicadores e regra ativa, retornando nível, pontuação e motivos.

### [X] T036 — Criar modelo RiskAssessment

Persistir resultado da classificação de risco com índices por estudante, nível de risco e data de avaliação.

### [X] T037 — Implementar classificação após importação

Após importação ou alteração de dados acadêmicos, executar cálculo de risco.

### [X] T038 — Implementar reprocessamento manual de risco

Permitir reprocessar classificações de um período/unidade quando regras forem alteradas.

### [X] T039 — Criar testes unitários de risco alto

Validar cenários de frequência, nota ou entregas críticas.

### [X] T040 — Criar testes unitários de risco médio

Validar cenários moderados.

### [X] T041 — Criar testes unitários de risco baixo

Validar cenários sem indicadores críticos.

### [X] T042 — Testar rastreabilidade da regra aplicada

Garantir que cada classificação aponte para a regra usada.

## 7. Fase 5 — Alertas e Priorização

### [X] T043 — Criar modelo Alert

Adicionar alerta com severidade, status, descrição, vínculo com `RiskAssessment`, `followUpCaseId` opcional e índices de consulta por estudante, data de geração e `followUpCaseId`.

### [X] T044 — Implementar geração automática de alertas

Gerar alerta crítico para risco alto e alerta de atenção para risco médio.

### [X] T045 — Implementar deduplicação básica de alertas

Evitar alertas duplicados para o mesmo aluno, período e nível de risco ainda ativo.

### [X] T046 — Criar lista priorizada de alertas

Tela paginada com ordenação por severidade, ausência de acompanhamento, tempo sem ação e pior indicador.

### [X] T047 — Adicionar filtros na lista de alertas

Filtros por curso, turma, período, risco e status.

### [X] T048 — Destacar casos críticos visualmente

Aplicar destaque visual para alertas críticos sem prejudicar acessibilidade.

### [X] T049 — Testar geração de alerta crítico

Validar que risco alto cria alerta crítico.

### [X] T050 — Testar geração de alerta de atenção

Validar que risco médio cria alerta de atenção.

### [X] T051 — Testar priorização de alertas

Validar ordenação e paginação da lista priorizada.

## 8. Fase 6 — Casos de Acompanhamento e Intervenções

### [X] T052 — Criar modelo CauseCategory

Adicionar categorias estruturadas de causa.

### [X] T053 — Criar seed de causas iniciais

Inserir categorias iniciais:

- dificuldade acadêmica;
- baixa frequência;
- baixo desempenho;
- dificuldade socioeconômica;
- problema de saúde;
- dificuldade de transporte;
- desmotivação;
- trabalho/conflito de horário;
- não informado;
- outro.

### [X] T054 — Criar modelo FollowUpCase

Adicionar caso com aluno, período, status, responsável, abertura, encerramento e índice para busca de caso ativo por estudante/período.

### [X] T055 — Criar modelo Intervention

Adicionar intervenção com causa, ação, observações, responsável, data e índice `(caseId, createdAt)` para histórico cronológico do caso.

### [X] T056 — Criar ou reutilizar caso ativo para alertas críticos e de atenção

Ao gerar alerta `CRITICAL` ou `ATTENTION`, procurar caso `PENDING` ou `IN_PROGRESS` do mesmo aluno/período; se existir, vincular o alerta ao caso existente; se não, criar novo caso `PENDING` e vincular o alerta.

### [X] T057 — Criar página de detalhes do caso

Exibir aluno, indicadores, risco, alerta, status e histórico.

### [X] T058 — Implementar registro de intervenção

Permitir informar causa, ação realizada e observações.

### [X] T059 — Atualizar status para em andamento

Ao registrar primeira intervenção, alterar caso de `PENDING` para `IN_PROGRESS`.

### [X] T060 — Implementar conclusão de caso

Permitir marcar caso como `COMPLETED`.

### [X] T061 — Implementar reabertura controlada de caso

Permitir reabrir caso concluído apenas para perfis autorizados.

### [X] T062 — Criar histórico de status

Registrar mudanças relevantes de status em auditoria.

### [X] T063 — Testar criação e reutilização de caso ativo

Validar abertura de novo caso quando não existir caso ativo e reaproveitamento do caso `PENDING`/`IN_PROGRESS` existente para o mesmo aluno/período.

### [X] T064 — Testar registro de intervenção

Validar persistência de causa, ação e observação.

### [X] T065 — Testar transições de status

Validar pendente, em andamento, concluído e reabertura.

## 9. Fase 7 — Dashboard e Relatórios

### [X] T066 — Criar dashboard inicial

Exibir cards e indicadores operacionais do MVP com fórmulas definidas para monitoramento, risco e acompanhamento.

### [X] T067 — Implementar relatório por aluno

Consolidar dados acadêmicos, risco atual, alertas e histórico de intervenções.

### [X] T068 — Implementar relatório por turma

Exibir distribuição de risco, status dos casos e causas recorrentes por turma.

### [X] T069 — Implementar relatório por curso

Exibir indicadores agregados por curso.

### [X] T070 — Implementar relatório por período

Exibir evolução e indicadores por período.

### [X] T071 — Implementar relatório de causas recorrentes

Agrupar intervenções por categoria de causa.

### [X] T072 — Implementar indicador de tempo entre alerta e ação

Calcular o tempo médio entre `Alert.generatedAt` e a primeira `Intervention.createdAt`.

### [X] T073 — Implementar taxa de resolução de casos

Calcular percentual de casos `COMPLETED` sobre o total de casos no filtro aplicado.

### [X] T074 — Criar gráficos gerenciais

Adicionar gráficos de distribuição de risco, causas e status.

### [X] T075 — Criar filtros globais de relatório

Permitir filtro por unidade, curso, turma e período.

### [X] T076 — Testar agregações dos relatórios

Validar números calculados, denominadores e filtros contra dados de teste conhecidos.

## 10. Fase 8 — Auditoria, LGPD e Confiabilidade

### [X] T078 — Auditar importação de dados

Registrar usuário, data, quantidade de registros aceitos e rejeitados.

### [X] T079 — Auditar alteração de regra de risco

Registrar criação, edição, ativação e desativação de regra.

### [X] T080 — Auditar acompanhamento

Registrar criação de intervenção, conclusão e reabertura de caso.

### [X] T081 — Revisar exposição de dados pessoais

Garantir que telas e logs exibam apenas dados necessários por perfil.

### [X] T082 — Implementar tratamento centralizado de erros

Padronizar retorno de erros de validação, autorização e falha interna.

### [X] T083 — Documentar rotina de backup

Criar instrução operacional para backup periódico do PostgreSQL.

### [X] T084 — Testar bloqueios de autorização

Validar que usuários sem permissão não executem ações sensíveis.

## 11. Fase 9 — Polimento, Acessibilidade e Piloto

### [X] T085 — Revisar UX dos fluxos principais

Reduzir etapas desnecessárias e melhorar mensagens para usuários não técnicos.

### [X] T086 — Revisar responsividade

Garantir uso adequado em desktop e tablets.

### [X] T087 — Revisar acessibilidade básica

Verificar labels, contraste, foco, navegação por teclado e feedback visual.

### [X] T088 — Criar dados de demonstração

Seed com unidade, curso, turma, alunos, registros acadêmicos, riscos e casos.

### [X] T089 — Criar documentação de uso do MVP

Documentar login, importação, análise de alertas, acompanhamento e relatórios.

### [X] T090 — Criar checklist de implantação piloto

Checklist com configuração, usuários, dados, treinamento e validação inicial.

### [X] T091 — Executar testes e2e do fluxo completo

Fluxo:

1. login;
2. importação;
3. classificação;
4. alerta;
5. acompanhamento;
6. conclusão;
7. relatório.

### [X] T092 — Corrigir bugs encontrados no piloto interno

Corrigir problemas antes da entrega para unidade piloto.

## 12. Roadmap por Entregas

### Entrega 1 — Fundação Técnica

Inclui T001 a T013, T077 e T093 a T096.

Resultado esperado:

- projeto executando;
- banco configurado;
- autenticação funcionando;
- gestão básica de usuários administrativos funcionando;
- layout base pronto;
- permissões iniciais implementadas.

### Entrega 2 — Cadastro e Importação

Inclui T014 a T031.

Resultado esperado:

- unidade, curso, turma e aluno cadastráveis;
- dados acadêmicos importáveis por CSV;
- registros inválidos identificados.

### Entrega 3 — Risco e Alertas

Inclui T032 a T051.

Resultado esperado:

- regras configuráveis;
- classificação automática;
- alertas priorizados.

### Entrega 4 — Acompanhamento

Inclui T052 a T065.

Resultado esperado:

- casos abertos;
- intervenções registradas;
- status gerenciado;
- causas estruturadas.

### Entrega 5 — Relatórios

Inclui T066 a T076.

Resultado esperado:

- dashboard funcional;
- relatórios por aluno, turma, curso e período;
- indicadores de acompanhamento.

### Entrega 6 — Segurança, Qualidade e Piloto

Inclui T078 a T092.

Resultado esperado:

- auditoria;
- revisão LGPD;
- testes e2e;
- documentação;
- MVP pronto para unidade piloto.

## 13. Critério Final de Aceitação do MVP

O MVP estará pronto quando:

1. usuário autenticado conseguir importar dados acadêmicos;
2. todos os alunos importados forem classificados por risco;
3. alunos de risco alto e médio gerarem alertas;
4. a equipe conseguir visualizar lista priorizada;
5. a equipe conseguir registrar causas, ações e observações;
6. casos puderem mudar de pendente para em andamento e concluído;
7. relatórios por aluno, turma, curso e período estiverem disponíveis;
8. gestão de usuários e perfis administrativos estiver funcional;
9. permissões por perfil estiverem ativas;
10. ações críticas forem auditadas;
11. testes dos fluxos principais estiverem passando.
