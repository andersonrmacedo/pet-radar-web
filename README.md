# 🐾 Pet Radar — Web

Frontend da aplicação Pet Radar: mapa colaborativo para animais perdidos e encontrados no Brasil.

🔗 **[Acesse o projeto](https://pet-radar-web.vercel.app)**

---

## 🛠 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Leaflet** — mapa interativo
- **React Hook Form** + **Zod** — formulários com validação
- **Axios** — cliente HTTP com interceptor JWT

---

## 📄 Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Redireciona para o mapa |
| `/map` | Mapa com todos os reports + filtros |
| `/new-report` | Formulário para criar report |
| `/dashboard` | Reports do usuário logado |
| `/login` | Login |
| `/register` | Cadastro |

---

## 🚀 Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

---

## 🔑 Variáveis de ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

---

## ☁️ Deploy

Hospedado na **Vercel** com deploy automático via GitHub.