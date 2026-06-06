# Checklist de Implantacao Piloto

- Confirmar `.env` com `DATABASE_URL`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL`.
- Subir PostgreSQL com `docker compose up -d postgres`.
- Executar `npm install`, `npx prisma migrate deploy`, `npx prisma db seed`.
- Validar login do usuario `ADMIN`.
- Conferir cadastro da unidade piloto, cursos e turmas.
- Treinar equipe sobre importacao CSV e leitura do relatorio de rejeicoes.
- Simular um caso critico com registro de intervencao.
- Validar relatorios com gestor institucional.
- Registrar plano de backup e responsaveis operacionais.
