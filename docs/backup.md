# Rotina de Backup do PostgreSQL

1. Suba o banco local com `docker compose up -d postgres`.
2. Gere o dump com:

```bash
docker exec evasao-sdd-postgres pg_dump -U postgres evasao_sdd > backup-$(date +%Y%m%d-%H%M).sql
```

3. Armazene o arquivo em local seguro com controle de acesso restrito.
4. Teste a restauracao periodicamente em uma base temporaria:

```bash
docker exec -i evasao-sdd-postgres psql -U postgres -d evasao_sdd < backup-YYYYMMDD-HHMM.sql
```

5. Nunca compartilhe dumps contendo dados pessoais fora do ambiente institucional autorizado.
