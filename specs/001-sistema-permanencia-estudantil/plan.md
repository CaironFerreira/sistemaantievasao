# plan.md — Plano Técnico de Implementação

## 1. Objetivo do Plano

Implementar o MVP do Sistema de Gestão de Permanência Estudantil seguindo a Constituição técnica, a especificação funcional descrita em `spec.md` e o modelo de dados descrito em `schema.md`.

O sistema deve transformar dados acadêmicos em classificações de risco, alertas priorizados, casos de acompanhamento e relatórios gerenciais.

## 2. Contexto Técnico

### 2.1 Aplicação

- Tipo: aplicação web administrativa.
- Público: equipes institucionais responsáveis por permanência estudantil.
- MVP: unidade piloto, com arquitetura preparada para múltiplas unidades.

### 2.2 Stack

- Next.js App Router.
- TypeScript.
- PostgreSQL.
- Prisma.
- Tailwind CSS.
- shadcn/ui.
- Auth.js.
- Zod.
- React Hook Form.
- Recharts.
- Vitest.
- Playwright.
- Docker Compose.

## 3. Requisitos Não Funcionais Considerados

### 3.1 Usabilidade

A interface deve ser simples, intuitiva e adequada para equipes não técnicas.

Decisões de implementação:

- dashboard inicial com indicadores essenciais;
- navegação lateral objetiva;
- formulários curtos e validados;
- mensagens claras de erro e sucesso;
- fluxos com poucas etapas;
- filtros visíveis nas páginas de listagem e relatórios.

### 3.2 Desempenho

O sistema deve responder rapidamente a consultas e suportar crescimento de volume.

Decisões de implementação:

- paginação obrigatória em listas;
- filtros no banco, não apenas no frontend;
- índices nos principais campos de consulta;
- agregações otimizadas para dashboard;
- importação CSV com validação em lote.

### 3.3 Segurança

O sistema deve proteger dados sensíveis dos estudantes e respeitar LGPD.

Decisões de implementação:

- autenticação obrigatória no painel;
- RBAC por perfil;
- validação no servidor;
- auditoria de ações críticas;
- minimização de dados exibidos por perfil;
- não exposição de dados pessoais em logs técnicos;
- proteção de rotas via middleware.

### 3.4 Confiabilidade

O sistema deve preservar integridade dos dados e permitir recuperação.

Decisões de implementação:

- transações para importação e geração de risco;
- constraints no banco;
- backups periódicos via rotina externa documentada;
- logs de erro para falhas de importação;
- histórico de acompanhamento preservado.

### 3.5 Escalabilidade

O sistema deve permitir expansão futura para múltiplas unidades.

Decisões de implementação:

- entidade `InstitutionUnit` desde o MVP;
- relacionamento de cursos e regras por unidade;
- filtros por unidade preparados no modelo;
- arquitetura modular por domínio.

### 3.6 Manutenibilidade

O sistema deve permitir atualização fácil das regras de risco e evolução sem interrupção crítica.

Decisões de implementação:

- serviço isolado para cálculo de risco;
- regras persistidas em banco;
- testes unitários para cálculo de risco;
- módulos separados por domínio;
- migrações versionadas.

### 3.7 Interoperabilidade futura

O MVP não terá integração complexa, mas deve preparar caminho para importações futuras.

Decisões de implementação:

- campo `source` em registros acadêmicos;
- importação CSV com mapeamento claro;
- camada de serviço separada para ingestão de dados;
- estrutura futura para conectores externos.

## 4. Arquitetura da Aplicação

```text
app/
  (auth)/
    login/
  (dashboard)/
    dashboard/
    alunos/
    riscos/
    alertas/
    acompanhamentos/
    relatorios/
    configuracoes/
      usuarios/
  api/
    imports/
    reports/
    risk-reprocess/

src/
  components/
    ui/
    layout/
    charts/
    tables/
  features/
    auth/
    users/
    students/
    academic-records/
    risk-rules/
    risk-assessments/
    alerts/
    follow-up/
    reports/
    imports/
    audit/
  lib/
    prisma.ts
    auth.ts
    permissions.ts
    validators.ts
  server/
    services/
    repositories/
    actions/
  tests/
```

## 5. Modelo de Dados

### 5.1 Entidades principais

- InstitutionUnit
- Course
- ClassGroup
- Student
- AcademicRecord
- RiskRule
- RiskAssessment
- Alert
- FollowUpCase
- Intervention
- CauseCategory
- User
- AuditLog

### 5.2 Relacionamentos principais

- Uma unidade possui muitos cursos.
- Um curso possui muitas turmas.
- Uma turma possui muitos alunos.
- Um aluno possui muitos registros acadêmicos.
- Um registro acadêmico gera uma classificação de risco.
- Uma classificação pode gerar um alerta.
- Um alerta pode abrir um caso de acompanhamento.
- Um caso possui várias intervenções.
- Uma intervenção possui uma causa categorizada.
- Usuários executam ações auditáveis.

## 6. Estratégia de Cálculo de Risco

### 6.1 Entrada

- frequência percentual;
- média de notas;
- entregas pendentes;
- total de entregas;
- regra ativa.

### 6.2 Saída

- nível de risco: `HIGH`, `MEDIUM`, `LOW`;
- pontuação calculada;
- motivos explicáveis.

### 6.3 Abordagem inicial

A V1 deve usar uma estratégia híbrida simples:

1. regras de corte para identificar risco alto imediatamente;
2. regras de corte para identificar risco médio;
3. pontuação ponderada para desempate e priorização.

Exemplo conceitual:

- frequência abaixo do limite crítico: alto risco;
- média abaixo do limite crítico: alto risco;
- muitas entregas pendentes: alto risco;
- indicadores moderadamente abaixo do esperado: médio risco;
- demais casos: baixo risco.

## 7. Estratégia de Alertas

### 7.1 Geração

Alertas serão gerados após cada classificação de risco.

### 7.2 Severidade

- `HIGH` → `CRITICAL`.
- `MEDIUM` → `ATTENTION`.
- `LOW` → sem abertura automática de caso.

### 7.3 Priorização

A lista priorizada será ordenada por:

1. severidade;
2. ausência de acompanhamento;
3. tempo desde geração do alerta;
4. pior indicador acadêmico;
5. pontuação de risco.

## 8. Estratégia de Acompanhamento

### 8.1 Caso

Todo alerta `CRITICAL` ou `ATTENTION` deve estar associado a um caso ativo.
A chave operacional do reaproveitamento é `studentId + period`.
Quando já existir caso `PENDING` ou `IN_PROGRESS` para o mesmo aluno e período, o novo alerta deve ser vinculado ao caso existente.
Quando não existir caso ativo, o sistema deve abrir um novo caso com status `PENDING`.

### 8.2 Status

- `PENDING`: caso aberto sem intervenção.
- `IN_PROGRESS`: caso com intervenção registrada.
- `COMPLETED`: caso encerrado.

### 8.3 Intervenções

Cada intervenção deve registrar:

- causa;
- ação realizada;
- observações;
- responsável;
- data.

## 9. Relatórios e Dashboard

### 9.1 Dashboard inicial

Cards mínimos:

- total de estudantes monitorados;
- estudantes em alto risco;
- estudantes em médio risco;
- casos pendentes;
- casos em andamento;
- casos concluídos;
- percentual de casos com acompanhamento registrado.

### 9.2 Relatórios

- relatório por aluno;
- relatório por turma;
- relatório por curso;
- relatório por período;
- relatório de causas recorrentes;
- relatório de tempo entre alerta e ação.

### 9.3 Visualizações

- cards de indicadores;
- gráficos de barras por risco;
- gráfico de pizza/rosca para distribuição de causas;
- tabela de casos priorizados;
- linha temporal de acompanhamento do aluno.

## 10. Segurança e Permissões

### 10.1 Permissões por perfil

| Ação | ADMIN | GESTOR | ACOMPANHAMENTO | LEITURA |
|---|---:|---:|---:|---:|
| Gerenciar usuários | Sim | Não | Não | Não |
| Configurar regras de risco | Sim | Sim | Não | Não |
| Importar dados | Sim | Sim | Não | Não |
| Ver dashboard | Sim | Sim | Sim | Sim |
| Ver alertas | Sim | Sim | Sim | Sim |
| Registrar acompanhamento | Sim | Sim | Sim | Não |
| Concluir caso | Sim | Sim | Sim | Não |
| Ver relatórios | Sim | Sim | Parcial | Parcial |
| Ver auditoria | Sim | Não | Não | Não |

## 11. Validações

### 11.1 CSV

Validações obrigatórias:

- matrícula obrigatória;
- nome obrigatório;
- curso obrigatório;
- turma obrigatória;
- período obrigatório;
- frequência entre 0 e 100;
- nota dentro da escala definida;
- entregas pendentes >= 0;
- total de entregas >= entregas pendentes.

### 11.2 Regras de risco

Validações obrigatórias:

- limites de alto risco devem ser mais críticos que limites de médio risco;
- pesos não podem ser negativos;
- soma dos pesos deve ser maior que zero;
- deve haver apenas uma regra ativa por unidade/período.

### 11.3 Acompanhamento

Validações obrigatórias:

- causa obrigatória;
- ação realizada obrigatória;
- observação opcional;
- caso concluído não pode receber intervenção sem reabertura autorizada.

## 12. Estratégia de Testes

### 12.1 Testes unitários

- cálculo de risco;
- validação de regras;
- priorização de alertas;
- transições de status;
- agregação de indicadores.

### 12.2 Testes de integração

- importação CSV completa;
- importação CSV com erros;
- geração de risco após importação;
- geração de alerta;
- criação de caso;
- registro de acompanhamento;
- gestão de usuários administrativos.

### 12.3 Testes e2e

Fluxos mínimos:

1. login;
2. importação de dados;
3. visualização de lista de risco;
4. abertura de caso;
5. registro de intervenção;
6. conclusão de caso;
7. visualização de relatório.

## 13. Plano de Entrega

### Fase 1 — Fundação

- configurar projeto;
- configurar banco;
- implementar autenticação;
- implementar gestão mínima de usuários internos;
- definir layout base;
- criar modelo de dados.

### Fase 2 — Dados Acadêmicos

- CRUD de unidade, curso, turma e aluno;
- importação CSV;
- validação de dados;
- persistência de registros acadêmicos.

### Fase 3 — Risco e Alertas

- configuração de regras;
- cálculo de risco;
- geração de alertas;
- lista priorizada.

### Fase 4 — Acompanhamento

- casos;
- intervenções;
- causas;
- status;
- histórico.

### Fase 5 — Relatórios

- dashboard;
- relatórios por aluno;
- relatórios agregados;
- indicadores gerenciais.

### Fase 6 — Qualidade e Piloto

- testes;
- ajustes de UX;
- auditoria;
- documentação de implantação;
- seed de dados;
- preparação para unidade piloto.

## 14. Riscos Técnicos

| Risco | Impacto | Mitigação |
|---|---|---|
| Dados CSV inconsistentes | Alto | Validação rígida e relatório de erros |
| Regras de risco mal calibradas | Alto | Regras configuráveis e reprocessamento controlado |
| Exposição de dados sensíveis | Alto | RBAC, logs mínimos e validação no servidor |
| Relatórios lentos | Médio | Índices, filtros e agregações otimizadas |
| Baixa adesão da equipe | Médio | UX simples e treinamento no piloto |

## 15. Definition of Done

Uma entrega só é considerada concluída quando:

- atende aos critérios de aceitação do `spec.md`;
- respeita o modelo de dados definido em `schema.md`;
- respeita a Constituição técnica;
- possui validação no servidor;
- possui tratamento de erro;
- possui teste unitário ou integração quando aplicável;
- não quebra permissões por perfil;
- preserva integridade dos dados;
- possui interface utilizável por usuário não técnico.
