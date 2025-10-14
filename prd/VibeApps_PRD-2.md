# VibeApps — Product Requirements Document (PRD)

_Last updated: 2025-10-11 (Europe/Vilnius)_

## 1. Overview
VibeApps is a lightweight public directory of “vibecoding” app builders and AI-assisted dev tools. Visitors can rate tools anonymously; vendors can submit paid edit proposals to improve their listings. The system auto-discovers new products via a crawler and computes an objective, tamper-resistant ranking.

## 2. Goals & Non-Goals
**Goals**
- Public, anonymous vote & rating for each listed product.
- Transparent, defensible ranking using Bayesian averages + engagement + DB-first-class bonus − difficulty/complexity penalty.
- Owner/representative **paid** edit proposals with admin moderation.
- Auto-discovery pipeline to find and queue candidate products for review.
- Import-ready dataset (CSV/JSON) and Supabase-first implementation.

**Non-Goals (v1)**
- No user accounts/social features.
- No comments/discussions.
- No vendor-controlled ranking boosts (edits change content only).

## 3. Users & Roles
- **Visitor (Anon):** Browse, filter, rate once per product.
- **Owner/Rep:** Submit a **paid** edit proposal (content changes only).
- **Admin:** Approve/reject edits, curate sources, merge duplicates.
- **System (Crawler):** Discover and queue candidate products.

## 4. Core User Stories
1. **As a visitor**, I can sort and filter the catalog and rate a product 1–5 stars, once per product.
2. **As an owner**, I can pay a small fee to submit an edit proposal improving my product text and tags.
3. **As an admin**, I can moderate proposals and apply approved changes.
4. **As the system**, I can discover new products and surface candidates for admin review.

## 5. Functional Requirements

### 5.1 Directory & Search
- List products from a **materialized ranking view** `product_scores`.
- Filters: `CategoryType`, `DBFit`, `OSS`, `DeployPath`.
- Sorts: `score` (default), `avg_rating`, `vote_count`.
- Product card shows: name, badges (Neon/Supabase/OSS), overview, score, avg rating, votes, Rate button.

### 5.2 Anonymous Voting
- 1–5 star widget; 1 vote per product per anonymous user.
- Anonymous identity via httpOnly cookie `anon_id` (UUID v4) + light server-side throttling.
- Optimistic UI; unique `(product_id, anon_id)` constraint in DB.

### 5.3 Ranking
Score is computed in DB (materialized view) to ensure transparency and prevent manipulation:

```
score =
  bayesian(avg_rating, vote_count, prior=3.5, k=20)
  + 0.15 * ln(1 + vote_count)
  + 0.20 * (first_class_supabase OR first_class_neon ? 1 : 0)
  - 0.03 * (difficulty_hint + complexity_hint)
```
- **Bayesian prior** stabilizes low-sample items.
- **Engagement** rewards participation without overpowering quality.
- **DB-first-class bonus** reflects developer DX for our audience.
- **Difficulty/complexity** is a gentle penalty to surface accessible tools.

### 5.4 Owner Paid Edit Proposals
- Form captures `proposer_email`, `proposer_claim`, `proposed_overview/pros/cons/tags`.
- On submit, create `edit_proposals` row → initiate **Stripe Checkout (EUR 29)**.
- On successful payment, `payment_status='paid'`, status remains `pending` until admin review.
- Admin **approve**: apply changes to `products`, refresh ranking view. **Reject**: keep audit trail.

### 5.5 Admin
- Protected route (simple token or Supabase auth for v1).
- Features: moderation queue, diffs of proposed vs current content, approve/reject, merge duplicates, bulk CSV import/export.
- Change log retained for every update.

### 5.6 Auto-Discovery (Crawler)
- **Sources**: RSS feeds (Product Hunt/Show HN/Indie Hackers), vendor blogs, curated lists, GitHub topics, SERP snapshots.
- Pipeline: `sources` → `crawl_queue` → fetcher → `crawl_results` (structured).
- Extraction: name, site, category hints, DB fit hints (keywords: “Supabase”, “Neon”, “Postgres”).
- Deduplication: fuzzy match on name/slug/domain; threshold > 0.88 merges to existing.
- Admin validates before publishing to `products`.

## 6. Non-Functional Requirements
- **Performance:** LCP < 2.5s on directory; pagination & ISR (60s) on Next.js.
- **Availability:** 99.9% target (stateless frontend + Supabase managed DB).
- **Security/Privacy:** No PII for voting; Stripe handles payment details.
- **SEO:** Static pages & metadata; product slugs; sitemap.xml.

## 7. Data Model (Supabase)
**Tables**
- `products` — canonical listing data.
- `votes` — anonymous ratings (`unique(product_id, anon_id)`).
- `edit_proposals` — paid edit requests.
- `payments` — Stripe webhook snapshots.
- `sources`, `crawl_queue`, `crawl_results` — auto-discovery pipeline.

**Ranking View**
- `product_scores` — materialized view computing `score` from `products`.

### 7.1 SQL (schema & policies)
```sql
-- PRODUCTS
create table public.products (
  id bigint primary key,
  name text not null,
  slug text unique not null,
  category_type text not null,
  db_fit text not null,
  first_class_neon boolean not null default false,
  first_class_supabase boolean not null default false,
  byo_postgres boolean not null default true,
  deploy_path text,
  oss boolean not null default false,
  pricing_model text,
  ai_builder boolean not null default false,
  designer_first boolean not null default false,
  enterprise_ready boolean not null default false,
  overview_short text,
  pros_short text,
  cons_short text,
  tags text,
  difficulty_hint int2 default 0,
  complexity_hint int2 default 0,
  avg_rating numeric default 0,
  vote_count int default 0,
  created_at timestamptz default now()
);

-- VOTES (anonymous)
create table public.votes (
  id bigserial primary key,
  product_id bigint references public.products(id) on delete cascade,
  anon_id text not null,
  rating int2 not null check (rating between 1 and 5),
  created_at timestamptz default now(),
  unique (product_id, anon_id)
);

-- EDIT PROPOSALS
create table public.edit_proposals (
  id bigserial primary key,
  product_id bigint references public.products(id) on delete cascade,
  proposer_email text,
  proposer_claim text,
  proposed_overview text,
  proposed_pros text,
  proposed_cons text,
  proposed_tags text,
  payment_status text default 'unpaid',
  status text default 'pending',
  created_at timestamptz default now(),
  reviewed_by text
);

-- PAYMENTS
create table public.payments (
  id bigserial primary key,
  product_id bigint references public.products(id) on delete cascade,
  proposal_id bigint references public.edit_proposals(id),
  amount_cents int not null,
  currency text not null default 'EUR',
  stripe_session_id text,
  stripe_payment_intent text,
  status text not null,
  created_at timestamptz default now()
);

-- CRAWL / SOURCES
create table public.sources (
  id bigserial primary key,
  name text not null,
  type text not null,          -- rss|site|scraper|api|serp
  url text not null,
  active boolean default true,
  weight int default 1
);

create table public.crawl_queue (
  id bigserial primary key,
  source_id bigint references public.sources(id),
  url text not null,
  status text default 'queued', -- queued|processing|done|failed
  scheduled_at timestamptz default now(),
  picked_at timestamptz,
  done_at timestamptz
);

create table public.crawl_results (
  id bigserial primary key,
  source_id bigint references public.sources(id),
  url text,
  title text,
  snippet text,
  raw jsonb,
  discovered_name text,
  discovered_slug text,
  discovered_site text,
  discovered_category text,
  discovered_dbfit text,
  confidence numeric default 0.0,
  created_at timestamptz default now()
);

-- RANKING VIEW
create materialized view public.product_scores as
select
  p.id,
  p.name,
  p.slug,
  p.category_type,
  p.db_fit,
  p.first_class_neon,
  p.first_class_supabase,
  p.byo_postgres,
  p.deploy_path,
  p.oss,
  p.pricing_model,
  p.ai_builder,
  p.designer_first,
  p.enterprise_ready,
  p.tags,
  p.avg_rating,
  p.vote_count,
  (
    (p.vote_count * p.avg_rating + 20 * 3.5) / nullif(p.vote_count + 20, 0)
  ) 
  + ln(greatest(p.vote_count,1)) * 0.15
  + (case when p.first_class_supabase or p.first_class_neon then 0.2 else 0 end)
  - (coalesce(p.difficulty_hint,0) + coalesce(p.complexity_hint,0)) * 0.03
  as score
from public.products p;

create index on public.votes (product_id);
create index on public.products (slug);
create index on public.crawl_results (discovered_slug);

-- RLS
alter table public.products enable row level security;
alter table public.votes enable row level security;
alter table public.edit_proposals enable row level security;
alter table public.payments enable row level security;

-- Policies
create policy "products_read" on public.products for select using (true);
create policy "votes_insert" on public.votes for insert with check (true);
create policy "votes_read" on public.votes for select using (true);

create policy "products_service_write"
  on public.products for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "edits_service_write"
  on public.edit_proposals for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "payments_service_write"
  on public.payments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
```

## 8. APIs & Edge Functions
- **/api/fingerprint** → returns/mints `anon_id` and sets httpOnly cookie.
- **Rate product** (client): insert into `votes` with `product_id`, `rating`, `anon_id`.
- **Stripe**
  - `/api/create-checkout-session` → create session for `proposal_id` (EUR 29).
  - `/api/stripe-webhook` → on `checkout.session.completed`, mark payment `succeeded`, set proposal `payment_status='paid'`.
- **Edge function `apply_edit`** (service role): if `status='approved' AND payment_status='paid'` then apply changes to `products` and `refresh materialized view product_scores`.

## 9. Security & Anti-Abuse
- Unique vote per product per anon; enforce DB unique constraint.
- Soft rate-limits per IP and per /16; suspicious clusters get **reduced weight** (shadow-rate).
- Minimum 5 votes before showing average publicly.
- Owner edits do **not** change rating/score directly; content changes only.

## 10. Observability
- Metrics: daily votes, conversion to paid edits, discovery yields, approval time.
- Alerts: crawler failures, webhook errors, sudden score spikes.
- Logs retained 90 days.

## 11. Roadmap
- **v1**: Directory, anon rating, paid edits, admin moderation, crawler MVP.
- **v1.1**: Version history UI, bulk ops, CSV export/import.
- **v1.2**: OAuth admin, improved dedupe, SERP connector.
- **v2**: Multi-criteria ratings (DX, docs, deploy, pricing), expert panels.
- **v2.1**: GitHub stars/releases import for OSS; add to score.
- **v2.2**: Vendor verification badge; public API & embeddable badges.
- **v3**: Newsletters & weekly trend snapshots.

## 12. Acceptance Criteria
- Can import CSV and render directory sorted by `score`.
- Anonymous user can rate exactly once per product; average updates.
- Owner can pay and submit an edit; admin can approve and see changes live.
- Crawler can enqueue URLs and produce at least 1 candidate per source daily.

## 13. Implementation Notes (Frontend Prompt)
Use Next.js + Supabase (anon) + Tailwind. Pages:
1. `/` — list with filters/sorts; cards with Rate button.
2. `/p/[slug]` — details + rating widget.
3. `/submit-edit/[slug]` — paid edit form → Stripe.
4. `/admin` — moderation queue (token-protected).

**SEO/ISR:** Static generation + ISR (60s). **Perf:** avoid blocking spinners; optimistic rating UX.

## 14. Appendix
- Seed dataset: `vibeapps_seed.csv` and `vibeapps_seed.json` (import via Supabase Table Editor).
- After import, run: `refresh materialized view public.product_scores;`
