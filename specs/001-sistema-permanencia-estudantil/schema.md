# schema.md — Modelo de Dados

## 1. Feature

Sistema de Gestão de Permanência Estudantil Baseado em Monitoramento de Risco de Evasão.

## 2. Objetivo do Modelo

Definir a estrutura relacional mínima do MVP para sustentar:

- gestão de usuários e perfis;
- cadastro institucional;
- ingestão manual e via CSV de dados acadêmicos;
- classificação de risco e geração de alertas;
- acompanhamento de casos e intervenções;
- relatórios por aluno, turma, curso e período;
- auditoria de ações críticas.

## 3. Princípios de Modelagem

- O modelo deve operar em PostgreSQL com Prisma.
- O MVP inicia com uma unidade piloto, mas o schema deve permitir múltiplas unidades institucionais.
- Regras de risco, classificações, alertas e acompanhamentos devem ser rastreáveis.
- O modelo não depende de integrações externas, IA avançada ou automações obrigatórias fora do sistema.

## 4. Entidades

### 4.1 InstitutionUnit

Representa uma unidade institucional.

Campos:

- id;
- name;
- code;
- active;
- createdAt;
- updatedAt.

### 4.2 Course

Representa um curso vinculado a uma unidade.

Campos:

- id;
- unitId;
- name;
- code;
- active;
- createdAt;
- updatedAt.

### 4.3 ClassGroup

Representa uma turma vinculada a um curso e período letivo.

Campos:

- id;
- courseId;
- name;
- period;
- active;
- createdAt;
- updatedAt.

### 4.4 Student

Representa um estudante monitorado.

Campos:

- id;
- enrollmentCode;
- name;
- email;
- courseId;
- classGroupId;
- active;
- createdAt;
- updatedAt.

### 4.5 AcademicRecord

Representa indicadores acadêmicos de um estudante em um período.

Campos:

- id;
- studentId;
- period;
- attendancePercent;
- averageGrade;
- pendingAssignments;
- totalAssignments;
- source;
- importedAt;
- createdAt;
- updatedAt.

### 4.6 RiskRule

Representa a regra configurável usada no cálculo de risco.

Campos:

- id;
- unitId;
- period;
- name;
- highRiskAttendanceThreshold;
- mediumRiskAttendanceThreshold;
- highRiskGradeThreshold;
- mediumRiskGradeThreshold;
- highRiskPendingAssignmentsThreshold;
- mediumRiskPendingAssignmentsThreshold;
- attendanceWeight;
- gradeWeight;
- assignmentsWeight;
- active;
- createdById;
- createdAt;
- updatedAt.

### 4.7 RiskAssessment

Representa o resultado persistido da classificação de risco.

Campos:

- id;
- studentId;
- academicRecordId;
- riskRuleId;
- riskLevel;
- score;
- reasons;
- assessedAt;
- createdAt.

### 4.8 Alert

Representa um alerta gerado a partir de uma classificação de risco.

Campos:

- id;
- studentId;
- riskAssessmentId;
- followUpCaseId;
- severity;
- title;
- description;
- status;
- generatedAt;
- createdAt;
- updatedAt.

### 4.9 FollowUpCase

Representa um caso ativo ou encerrado de acompanhamento.

Campos:

- id;
- studentId;
- period;
- status;
- openedAt;
- closedAt;
- assignedToId;
- createdAt;
- updatedAt.

### 4.10 Intervention

Representa uma ação registrada em um caso.

Campos:

- id;
- caseId;
- causeCategoryId;
- actionTaken;
- notes;
- createdById;
- createdAt.

### 4.11 CauseCategory

Representa a categoria estruturada de causa de evasão.

Campos:

- id;
- name;
- description;
- active;
- createdAt;
- updatedAt.

### 4.12 User

Representa um usuário interno do sistema.

Campos:

- id;
- name;
- email;
- passwordHash;
- role;
- active;
- createdAt;
- updatedAt.

### 4.13 AuditLog

Representa um registro de auditoria.

Campos:

- id;
- userId;
- action;
- entity;
- entityId;
- metadata;
- createdAt.

## 5. Relacionamentos

- Uma `InstitutionUnit` possui muitos `Course`.
- Um `Course` possui muitas `ClassGroup`.
- Uma `ClassGroup` possui muitos `Student`.
- Um `Student` possui muitos `AcademicRecord`.
- Um `AcademicRecord` pode originar uma ou mais `RiskAssessment` em reprocessamentos controlados.
- Uma `RiskAssessment` pode gerar um `Alert`.
- Um `FollowUpCase` pode agregar múltiplos `Alert` do mesmo aluno e período.
- Um `Alert` `CRITICAL` ou `ATTENTION` deve ser vinculado a um `FollowUpCase` ativo do mesmo aluno/período ou abrir um novo caso.
- Um `FollowUpCase` possui muitas `Intervention`.
- Uma `Intervention` referencia uma `CauseCategory`.
- Um `User` pode criar `RiskRule`, registrar `Intervention` e gerar `AuditLog`.

## 6. Enums

### 6.1 UserRole

- `ADMIN`
- `GESTOR`
- `ACOMPANHAMENTO`
- `LEITURA`

### 6.2 RiskLevel

- `HIGH`
- `MEDIUM`
- `LOW`

### 6.3 AlertSeverity

- `CRITICAL`
- `ATTENTION`
- `INFO`

### 6.4 CaseStatus

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`

## 7. Indices Obrigatorios

- `Course(unitId)`
- `ClassGroup(courseId, period)`
- `Student(courseId, classGroupId, active)`
- `AcademicRecord(studentId, period)`
- `RiskRule(unitId, period, active)`
- `RiskAssessment(studentId, riskLevel, assessedAt)`
- `Alert(studentId, severity, generatedAt)`
- `Alert(followUpCaseId)`
- `FollowUpCase(studentId, status, openedAt)`
- `FollowUpCase(studentId, period, status)`
- `Intervention(caseId, createdAt)`

## 8. Regras de Integridade

- Deve existir no máximo uma `RiskRule` ativa por unidade e período.
- Registros CSV inválidos não podem ser persistidos.
- Todo estudante monitorado com `AcademicRecord` no período deve possuir uma `RiskAssessment` vigente.
- `RiskAssessment` com `HIGH` deve gerar `Alert` com `CRITICAL`.
- `RiskAssessment` com `MEDIUM` deve gerar `Alert` com `ATTENTION`.
- `RiskAssessment` com `LOW` não deve abrir caso automaticamente.
- Deve existir no máximo um `FollowUpCase` ativo (`PENDING` ou `IN_PROGRESS`) por estudante e período.
- Todo `Alert` `CRITICAL` ou `ATTENTION` deve referenciar um `FollowUpCase`.
- Todo `FollowUpCase` novo deve iniciar com status `PENDING`.
- A primeira `Intervention` deve mover o caso para `IN_PROGRESS`, exceto quando o caso já estiver `COMPLETED`.
- Caso `COMPLETED` só pode ser reaberto por perfil autorizado.
- Usuário inativo não pode autenticar.
- O sistema deve impedir que o último `ADMIN` ativo perca privilégio administrativo.
- O sistema deve auditar importação de dados, alteração de regra de risco, criação e edição de acompanhamento, alteração de status de caso e gestão de usuários.

## 9. Observacoes do MVP

- A ingestão inicial de dados aceita CSV e cadastro manual básico.
- O modelo suporta relatórios por aluno, turma, curso e período sem depender de integrações externas.
- O MVP não inclui modelos avançados de IA, predição estatística sofisticada ou aplicativo mobile nativo.
