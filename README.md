This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Painel administrativo de orações

Acesse `/admin` para criar, editar, excluir, publicar e organizar orações por ordem manual, título ou dia da jornada. O painel usa uma senha administrativa e uma sessão HTTP-only; alterações no banco são feitas somente no servidor.

### Configuração

1. Copie `.env.example` para `.env` e preencha as variáveis com os dados do seu projeto.
2. No Supabase, abra o **SQL Editor** e execute o conteúdo de `supabase/migrations/20261016_create_prayers.sql`. A tabela aplica RLS: visitantes só podem ler orações publicadas; escrita fica restrita ao servidor.
3. No painel de API keys do projeto Supabase, copie a chave **secret** (ou a chave `service_role` legada) para uma variável de ambiente exclusivamente do servidor: `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`. Nunca use o prefixo `NEXT_PUBLIC_` nessa chave.
4. Configure `ADMIN_PASSWORD` com a senha desejada e `ADMIN_SESSION_SECRET` com um segredo aleatório de pelo menos 32 caracteres. Mantenha essas variáveis no `.env` local e também nas variáveis de ambiente da hospedagem.
5. Reinicie o servidor e entre em `/admin`.

O endereço e a chave pública do Supabase já são lidos de `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Se a chave de servidor ainda não estiver configurada, o painel exibirá um aviso de configuração; não há chave administrativa armazenada no código.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
