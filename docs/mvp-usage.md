# Uso do MVP

## Credenciais iniciais

- Admin: `admin@sdd.local` / `Admin123!`
- Gestor: `gestor@sdd.local` / `Admin123!`
- Acompanhamento: `acompanhamento@sdd.local` / `Admin123!`
- Leitura: `leitura@sdd.local` / `Admin123!`

## Fluxo principal

1. Entre em `/login`.
2. Cadastre unidade, curso, turma e usuarios em `Configuracoes`.
3. Cadastre alunos manualmente ou use `Importacoes` com CSV.
4. Cadastre ou ajuste a regra ativa em `Configuracoes > Regras de risco`.
5. Consulte `Alertas` para ver priorizacao de risco alto e medio.
6. Abra `Acompanhamentos`, registre causa, acao e observacoes.
7. Use `Relatorios` para filtros por unidade, curso, turma, periodo e aluno.

## Estrutura do CSV

Cabecalhos obrigatorios:

```text
enrollmentCode,studentName,studentEmail,unitCode,courseCode,classGroupName,period,attendancePercent,averageGrade,pendingAssignments,totalAssignments
```

Exemplo:

```text
2026004,Daniel Costa,daniel.costa@alunos.local,CAMPUS-CENTRO,ADS,ADS-1A,2026.1,71,5.8,2,8
```
