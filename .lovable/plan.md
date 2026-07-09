# Migração KUBASILE para Supabase

## 1. Configuração inicial

- Instalar `@supabase/supabase-js`.
- Criar `src/integrations/supabase/client.ts` com URL + anon key fornecidas.
- Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Gerar ficheiro **`supabase/migrations/0001_init.sql`** pronto para colar no SQL Editor do seu projeto Supabase (ou correr via CLI).

## 2. Schema da base de dados

Tabelas em `public`:

```text
profiles           id (uuid PK → auth.users), name, phone, gender, address, area,
                   points, avatar_url, created_at
app_role (enum)    'admin' | 'operator' | 'citizen'
user_roles         id, user_id → auth.users, role app_role, unique(user_id, role)
eco_points         id, name, address, lat, lng, materials text[], active bool,
                   operator_id → profiles, created_at
deposits           id, citizen_id → profiles, operator_id → profiles,
                   eco_point_id → eco_points, materials text[], weight_g int,
                   points int, photo_url, date timestamptz
reports            id, citizen_id → profiles, type, area, description,
                   lat, lng, photo_url, status ('open'|'in_progress'|'resolved'),
                   date timestamptz
alerts             id, operator_id → profiles, title, description, severity
                   ('low'|'medium'|'critical'), area, lat, lng, date timestamptz
redemptions        id, citizen_id → profiles, reward_name, points_cost, date
```

Todas com:
- `GRANT` explícito para `authenticated` + `service_role` (e `anon SELECT` em `eco_points` e `alerts` para leitura pública opcional).
- `ENABLE ROW LEVEL SECURITY`.
- Função `public.has_role(uuid, app_role) SECURITY DEFINER` para evitar recursão.
- Trigger `handle_new_user()` que insere `profiles` + role default `citizen` ao criar utilizador.
- Trigger que soma pontos ao `profiles.points` sempre que se insere um `deposit`.

## 3. RLS (resumo)

- **profiles**: cada user vê/edita o seu; admin vê todos.
- **user_roles**: só admin gere; cada user lê o seu.
- **eco_points**: leitura pública; escrita só admin.
- **deposits**: cidadão vê os seus; operador insere; admin vê tudo.
- **reports**: cidadão cria e vê os seus; operador/admin vê tudo e atualiza status.
- **alerts**: leitura pública (autenticados); operador cria os seus; admin gere tudo.
- **redemptions**: cidadão vê os seus.

## 4. Autenticação

- Página `Login` refeita com **Email + Password** e botão **Google** (`signInWithOAuth({ provider: 'google', redirectTo: window.location.origin })`).
- Nova página `SignUp` (email + password + dados de perfil).
- Página `Register` reaproveitada para completar perfil pós-OAuth (nome, telemóvel, morada, sexo).
- Hook `useAuth()` central com `onAuthStateChange` + `getUser()` e redirect por role.
- Protecção de rotas: cidadão → `/home`, operador → `/operator`, admin → `/admin`.

## 5. Storage

- Bucket **`kubasile-photos`** (público) para fotos de reports e depósitos.
- Políticas: upload só autenticado; leitura pública.

## 6. Refactor do frontend

Substituir todas as chamadas a `store.get()` / `mockData` por queries Supabase:

- `Home`, `History`, `Points`, `Profile` (cidadão) → `deposits`, `reports`, `redemptions`, `profiles`.
- `EcoPoints`, `PointDetail` → `eco_points`.
- `Alerts` → `alerts`.
- `Report` → insert em `reports` + upload de foto.
- `OperatorHome/Deposit/AlertNew/Alerts/Summary` → CRUD real.
- `Admin*` (Dashboard, Deposits, Reports, Alerts, EcoPoints, Operators, Analytics, Settings) → queries reais + gestão de roles.
- Remover `src/lib/mockData.ts` (manter apenas types partilhados num `src/types.ts`).

## 7. Entregáveis

- `supabase/migrations/0001_init.sql` — script SQL único para você correr no SQL Editor.
- Código totalmente refatorado, zero mocks, zero `localStorage` para dados.
- Instruções curtas de setup (activar Google provider, adicionar redirect URL, correr SQL, criar 1º admin via SQL snippet).

## Passo seguinte

Cola aqui a `SUPABASE_URL` e a `SUPABASE_PUBLISHABLE_KEY` do teu projeto. Assim que as tiver, executo a migração completa numa só passagem.
