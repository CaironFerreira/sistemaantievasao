# spec.md — Especificação Funcional

## 1. Feature

Sistema de Gestão de Permanência Estudantil Baseado em Monitoramento de Risco de Evasão.

## 2. Objetivo da Feature

Permitir que uma instituição monitore dados acadêmicos, identifique estudantes em risco de evasão, gere alertas priorizados e registre intervenções realizadas pela equipe responsável pelo acompanhamento estudantil.

## 3. Escopo Funcional do MVP

Inclui:

- cadastro/importação de dados acadêmicos;
- gestão de usuários e perfis de acesso;
- classificação de risco de evasão;
- geração de alertas automáticos;
- lista priorizada de estudantes em risco;
- registro de acompanhamento e intervenções;
- gestão de status dos casos;
- categorização de causas de evasão;
- relatórios por aluno, turma, curso e período;
- indicadores de evasão e acompanhamento.

Não inclui:

- modelos avançados de IA;
- integrações complexas com múltiplos sistemas;
- aplicativo mobile nativo;
- automações externas obrigatórias.

## 4. Personas

### 4.1 Administrador

Usuário responsável por configurar o sistema, gerenciar usuários, cursos, turmas, períodos e regras de risco.

### 4.2 Gestor Institucional

Usuário responsável por acompanhar indicadores, visualizar relatórios e apoiar decisões estratégicas.

### 4.3 Equipe de Acompanhamento

Usuário responsável por analisar alertas, registrar causas, ações realizadas, observações e evolução dos casos.

### 4.4 Usuário de Leitura

Usuário com acesso limitado para consultar relatórios e indicadores autorizados.

## 5. Requisitos Funcionais

### RF01 — Importar ou registrar dados acadêmicos

O sistema deve permitir importar ou registrar dados acadêmicos dos estudantes, incluindo:

- frequência;
- notas;
- entregas/atividades.

#### Critérios de Aceitação

- O usuário autenticado com permissão deve conseguir importar arquivo CSV.
- O sistema deve validar colunas obrigatórias.
- O sistema deve informar registros aceitos e rejeitados.
- O sistema deve permitir cadastro ou edição manual de dados acadêmicos.
- Dados inválidos não devem ser persistidos sem validação.

---

### RF02 — Classificar alunos por nível de risco

O sistema deve classificar estudantes monitorados em:

- alto risco;
- médio risco;
- baixo risco.

A classificação deve ser baseada em regras configuráveis.

#### Critérios de Aceitação

- Todo aluno monitorado deve possuir uma classificação de risco.
- A classificação deve ser recalculada quando houver atualização dos indicadores.
- A regra usada no cálculo deve ser rastreável.
- A alteração de regra deve afetar novas classificações ou reprocessamentos controlados.

---

### RF03 — Configurar regras de risco

O sistema deve permitir configurar regras usadas para cálculo do risco.

#### Parâmetros mínimos

- limite de frequência para risco alto;
- limite de frequência para risco médio;
- limite de nota para risco alto;
- limite de nota para risco médio;
- limite de entregas pendentes para risco alto;
- limite de entregas pendentes para risco médio;
- pesos por indicador quando for usado cálculo por pontuação.

#### Critérios de Aceitação

- Apenas usuários autorizados podem alterar regras.
- O sistema deve validar limites antes de salvar.
- Deve existir uma regra ativa por unidade/período.
- Mudanças devem ser auditadas.

---

### RF04 — Gerar alertas automáticos

O sistema deve gerar alertas automáticos para estudantes classificados em risco.

#### Critérios de Aceitação

- Estudantes de alto risco devem gerar alerta crítico.
- Estudantes de médio risco devem gerar alerta de atenção.
- Estudantes de baixo risco podem aparecer apenas no monitoramento geral.
- Alertas devem conter aluno, turma, curso, período, nível de risco e motivos principais.

---

### RF05 — Exibir lista priorizada de alunos em risco

O sistema deve exibir uma lista priorizada de estudantes em risco.

#### Ordenação mínima

1. alto risco;
2. médio risco;
3. casos sem acompanhamento registrado;
4. maior tempo sem ação;
5. menor frequência ou pior indicador combinado.

#### Critérios de Aceitação

- A lista deve permitir filtro por curso, turma, período, risco e status.
- Casos críticos devem ser visualmente destacados.
- A listagem deve ser paginada.

---

### RF06 — Registrar acompanhamento

O sistema deve permitir registrar acompanhamento de estudantes em risco.

#### Campos mínimos

- aluno;
- alerta/caso relacionado;
- causa identificada;
- ação realizada;
- observações;
- responsável;
- data do registro.

#### Critérios de Aceitação

- O usuário autorizado deve conseguir adicionar acompanhamento a um caso.
- O histórico de acompanhamentos deve ser preservado.
- O registro deve ficar vinculado ao estudante e ao caso.
- O sistema deve registrar responsável e data automaticamente.

---

### RF07 — Categorizar causas de evasão

O sistema deve oferecer dropdown estruturado para causas identificadas.

#### Categorias iniciais sugeridas

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

#### Critérios de Aceitação

- A causa deve ser selecionada de uma lista estruturada.
- A opção `outro` deve permitir descrição complementar.
- As causas devem alimentar relatórios gerenciais.

---

### RF08 — Gerenciar status dos casos

O sistema deve permitir definir status dos casos:

- pendente;
- em andamento;
- concluído.

#### Critérios de Aceitação

- Todo alerta `CRITICAL` ou `ATTENTION` deve abrir automaticamente um caso ativo ou ser vinculado a um caso ativo existente do mesmo aluno/período.
- O status inicial deve ser `pendente`.
- O status pode mudar para `em andamento` quando houver ação registrada.
- O status pode mudar para `concluído` quando o acompanhamento for encerrado.
- Mudanças de status devem ser registradas em histórico.

---

### RF09 — Gerar relatórios por aluno

O sistema deve gerar relatório individual do aluno.

#### Conteúdo mínimo

- dados de identificação acadêmica;
- curso;
- turma;
- período;
- indicadores acadêmicos;
- nível de risco atual;
- histórico de alertas;
- histórico de acompanhamentos;
- status atual do caso.

#### Critérios de Aceitação

- O relatório deve ser filtrável por aluno.
- O relatório deve consolidar dados acadêmicos e intervenções.

---

### RF10 — Gerar relatórios por turma, curso e período

O sistema deve gerar relatórios agregados por:

- turma;
- curso;
- período.

#### Indicadores mínimos

- total de estudantes monitorados;
- quantidade por nível de risco;
- percentual por nível de risco;
- total de alertas;
- total de casos pendentes;
- total de casos em andamento;
- total de casos concluídos;
- causas mais recorrentes;
- tempo médio entre alerta e primeira ação.

#### Critérios de Aceitação

- O usuário deve conseguir filtrar por turma, curso e período.
- O sistema deve exibir indicadores em cards e gráficos.
- Os dados devem ser consistentes com os registros persistidos.

---

### RF11 — Exibir indicadores de evasão e acompanhamento

O sistema deve exibir indicadores operacionais e de acompanhamento em dashboard gerencial.

#### Indicadores mínimos do MVP

- percentual de estudantes monitorados = estudantes com `AcademicRecord` no período / estudantes ativos no filtro;
- percentual de estudantes monitorados com alerta = estudantes com alerta `CRITICAL` ou `ATTENTION` / estudantes monitorados;
- percentual de casos com acompanhamento registrado = casos com ao menos uma `Intervention` / casos no filtro;
- tempo médio entre alerta e primeira ação = média entre `Alert.generatedAt` e a primeira `Intervention.createdAt`;
- número de estudantes em risco = estudantes com `RiskAssessment.riskLevel` `HIGH` ou `MEDIUM` no filtro;
- taxa de resolução de casos = casos `COMPLETED` / total de casos no filtro;
- volume de intervenções realizadas = quantidade de `Intervention` no filtro.

#### Critérios de Aceitação

- Os indicadores devem estar disponíveis em dashboard gerencial.
- Indicadores devem respeitar filtros de curso, turma e período.
- Todo percentual exibido deve ter denominador definido pelo filtro aplicado.
- Indicadores subjetivos, como percepção de precisão e engajamento de usuários, ficam fora do MVP.

---

### RF12 — Gerenciar usuários e perfis de acesso

O sistema deve permitir que usuários `ADMIN` gerenciem contas internas e atribuam perfis de acesso.

#### Operações mínimas

- criar usuário com nome, email e perfil;
- ativar e desativar usuário;
- alterar perfil entre `ADMIN`, `GESTOR`, `ACOMPANHAMENTO` e `LEITURA`.

#### Critérios de Aceitação

- Apenas usuários `ADMIN` podem criar, alterar perfil, ativar ou desativar usuários.
- Usuário desativado não pode autenticar.
- Alterações de perfil e status devem ser auditadas.
- O sistema deve impedir que o último `ADMIN` ativo remova o próprio acesso administrativo.

## 6. Entidades de Domínio

O detalhamento estrutural de campos, relacionamentos, enums, índices e regras de integridade é mantido em `schema.md`, que é a fonte de verdade do modelo de dados desta feature.

Nesta especificação, as entidades são referenciadas apenas no nível funcional: `InstitutionUnit`, `Course`, `ClassGroup`, `Student`, `AcademicRecord`, `RiskRule`, `RiskAssessment`, `Alert`, `FollowUpCase`, `Intervention`, `CauseCategory`, `User` e `AuditLog`.

Qualquer alteração estrutural nessas entidades deve ser feita primeiro em `schema.md` e refletida aqui apenas quando impactar comportamento funcional.

## 7. Fluxos Funcionais

### 7.1 Fluxo de importação e classificação

1. Usuário importa CSV ou registra dados manualmente.
2. Sistema valida dados.
3. Sistema grava indicadores acadêmicos.
4. Sistema aplica regra de risco ativa.
5. Sistema cria classificação de risco.
6. Sistema gera alerta para riscos alto e médio.
7. Sistema vincula o alerta a um caso `PENDING` ou `IN_PROGRESS` existente do mesmo aluno/período ou cria um novo caso `PENDING` quando não houver caso ativo.

### 7.2 Fluxo de acompanhamento

1. Usuário acessa lista priorizada de alertas.
2. Usuário seleciona estudante/caso.
3. Usuário registra causa, ação e observações.
4. Sistema altera status conforme ação realizada.
5. Sistema atualiza indicadores de acompanhamento.

### 7.3 Fluxo de relatório

1. Usuário acessa área de relatórios.
2. Usuário define filtros.
3. Sistema consolida dados acadêmicos, riscos, alertas e acompanhamentos.
4. Sistema exibe cards, tabelas e gráficos.

## 8. Regras de Negócio

### RN01 — Classificação obrigatória

Todo estudante monitorado deve possuir uma classificação de risco vigente.

### RN02 — Risco alto gera alerta crítico

Toda classificação `HIGH` deve gerar alerta `CRITICAL`.

### RN03 — Risco médio gera alerta de atenção

Toda classificação `MEDIUM` deve gerar alerta `ATTENTION`.

### RN04 — Risco baixo não exige caso ativo

Classificação `LOW` não deve abrir caso de acompanhamento automaticamente.

### RN05 — Caso pendente por padrão

Todo novo caso deve iniciar com status `PENDING`.

### RN06 — Registro de intervenção move caso para andamento

Ao registrar a primeira intervenção, o caso deve mudar para `IN_PROGRESS`, exceto quando já estiver `COMPLETED`.

### RN07 — Caso concluído não deve ser alterado sem permissão

Casos concluídos só podem ser reabertos por usuários autorizados.

### RN08 — Causas alimentam relatórios

Toda causa selecionada em intervenção deve ser considerada nos relatórios de causas recorrentes.

## 9. Métricas do Produto

- percentual de estudantes monitorados com alerta;
- percentual de casos com acompanhamento registrado;
- tempo médio entre alerta e primeira ação;
- número de estudantes em risco identificados;
- número de intervenções realizadas;
- taxa de resolução dos casos;
- causas mais recorrentes.
