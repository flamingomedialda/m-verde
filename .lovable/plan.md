# Plano — Fase 3

Vou implementar em blocos independentes. Cada bloco tem alterações de código + (quando necessário) migração de base de dados.

## 1. Geofencing do Operador (raio 100m)

- Ao carregar `useAuth` para um utilizador com role `operator`, ir buscar o eco-ponto associado (via `profile.eco_point_id`) e guardar em `localStorage` sob a chave `kubasile-operator-ecopoint` (`{id, name, lat, lng, area, cached_at}`).
- Criar helper `src/lib/geo.ts` com `haversineMeters(lat1,lng1,lat2,lng2)` e `getCurrentPosition()` (Promise wrapper de `navigator.geolocation`).
- Em `OperatorDeposit.tsx` (e `OperatorAlertNew.tsx`): antes de submeter, obter posição actual; se distância > 100 m ao eco-ponto em cache → bloquear com toast "Fora do raio permitido (100 m do Eco Ponto X)".
- Mostrar no topo do `OperatorHome` um badge com o nome do eco-ponto associado e um botão "Verificar localização" que dá feedback visual (dentro/fora do raio).
- Cache é invalidada ao logout e ao mudar de operador; refresca se `eco_point_id` do profile mudar.

## 2. Sessão persistente offline

Problema: quando cai a rede, `onAuthStateChange` pode disparar `SIGNED_OUT` porque o refresh token falha.

Correcções em `useAuth.tsx` + `client.ts`:
- Já usamos `persistSession: true` + `localStorage`. Adicionar tratamento no listener: ignorar transições para `null` quando o motivo é falha de rede — só limpar estado no evento `SIGNED_OUT` explícito.
- Fazer cache do `profile` e `role` em `localStorage` (`kubasile-profile`, `kubasile-role`) e hidratar imediatamente no arranque, antes do `INITIAL_SESSION`, para que a UI não pisque nem redireccione para login se offline.
- No `AuthGate`: só redireccionar para `/` quando `!session && !cachedRole` (ou seja, realmente sem credenciais). Se houver sessão em cache mas sem rede, deixar o utilizador continuar.
- Adicionar listener `window.addEventListener('online', () => supabase.auth.refreshSession())` para re-sincronizar quando volta a rede.

## 3. Módulo Admin — Gestão de Utilizadores

Nova página `src/pages/admin/AdminUsers.tsx` + rota + item no `AdminSidebar`.

Funcionalidades:
- Listar todos os profiles com role (join com `user_roles`), paginação simples client-side.
- Filtros: por nome/telemóvel (search), por role (todos / cidadão / operador / admin), por estado (activo / bloqueado).
- Acções por linha: **Promover a admin**, **Despromover**, **Bloquear / Desbloquear**, **Ver detalhes** (deposits, pontos, reports).
- Adicionar coluna `blocked boolean default false` em `profiles` (migração).
- Ao bloquear: `blocked=true`; `AuthGate` verifica `profile.blocked` e força logout com mensagem "Conta bloqueada. Contacte o suporte."

Migração:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false;
```

## 4. Marketplace

### Esquema (migração)
```sql
CREATE TYPE product_category AS ENUM ('recharge','food','stationery','other');

CREATE TABLE public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category product_category not null,
  points_cost int not null check (points_cost > 0),
  description text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Códigos de recarga (um por unidade)
CREATE TABLE public.recharge_codes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code text not null,
  status text not null default 'available' check (status in ('available','reserved','used')),
  used_by uuid references public.profiles(id),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (product_id, code)
);

-- Stock físico por eco-ponto (alimentos, cadernos, etc.)
CREATE TABLE public.product_stock (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  eco_point_id uuid not null references public.eco_points(id) on delete cascade,
  quantity int not null default 0 check (quantity >= 0),
  unique (product_id, eco_point_id)
);
```
+ GRANTs + RLS (admin: full; authenticated: SELECT em `products` activos e `product_stock`; `recharge_codes` só o dono do `used_by` vê o seu).

Estender `redemptions` para guardar `product_id` e (opcional) `recharge_code_id` / `eco_point_id`.

### UI
- **Admin > Marketplace** (`AdminMarketplace.tsx`):
  - Criar/editar/eliminar produtos.
  - Categoria `recharge` → formulário para colar N códigos (um por linha) associados ao produto.
  - Categorias físicas → inputs de quantidade por eco-ponto.
  - Lista com stock disponível (códigos livres ou soma de quantities).
- **Cidadão > Loja** (`Marketplace.tsx`, substitui/complementa `EcoPoints` de recompensas):
  - Grelha por categoria; botão "Trocar" desactivado se pontos insuficientes ou sem stock.
  - Ao trocar recarga: reservar código disponível → marcar `used`, criar redemption, descontar pontos, mostrar código ao utilizador.
  - Ao trocar item físico: escolher eco-ponto com stock > 0, decrementar `quantity`, criar redemption com estado "para levantar".
- Tudo feito via RPC `redeem_product(product_id, eco_point_id?)` `SECURITY DEFINER` para garantir atomicidade (débito de pontos + reserva de código/stock).

## 5. FAQ + Contacto (cidadão)

Nova página `src/pages/Faq.tsx` acessível em `/faq` e ligada no `Profile.tsx` (item "Ajuda").
- Accordion com ~8 perguntas frequentes (como ganhar pontos, onde trocar, o que é eco-ponto, etc.).
- Cartão "Contactar suporte" com email `suporte@kubasile.co.mz` (mailto) e formulário simples que abre o cliente de email pré-preenchido.

## Ordem de implementação

1. Migração BD (colunas + tabelas marketplace).
2. Sessão persistente + cache profile/role (base para tudo o resto).
3. Geofencing operador.
4. Admin — Gestão de utilizadores.
5. Admin — Marketplace + página loja do cidadão + RPC atómico.
6. FAQ + contacto.

Confirma para eu avançar (ou diz-me se queres cortar/reordenar algum bloco — por exemplo deixar Marketplace para uma fase seguinte).
