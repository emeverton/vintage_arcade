import { Migration } from "@medusajs/framework/mikro-orm/migrations"
export class Migration20260920210000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`create table if not exists vintage_delivery_control (
      id text primary key, anchor_key text not null unique,
      generation integer not null default 0 check (generation >= 0), revision_counter integer not null check (revision_counter >= 1),
      active_rule_id text null references vintage_delivery_rule(id), active_policy jsonb not null, bootstrap_policy jsonb not null,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz null
    );`)
    this.addSql(`create table if not exists vintage_delivery_audit (
      id text primary key, request_key text not null unique, request_hash text not null, actor_id text not null,
      action text not null check (action in ('draft','publish','rollback')), option_id text not null references vintage_delivery_control(id),
      rule_id text null references vintage_delivery_rule(id), generation integer not null, reason text not null check (length(reason) between 5 and 500), payload jsonb not null,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz null
    );`)
    this.addSql(`create index if not exists vintage_delivery_audit_option on vintage_delivery_audit(option_id, created_at);`)
    this.addSql(`create or replace function vintage_immutable_delivery_audit() returns trigger language plpgsql as $$ begin raise exception 'Delivery audit is append-only'; end; $$;`)
    this.addSql(`create trigger vintage_delivery_audit_immutable before update or delete on vintage_delivery_audit for each row execute function vintage_immutable_delivery_audit();`)
    this.addSql(`create or replace function vintage_immutable_managed_revision() returns trigger language plpgsql as $$ begin if old.revision_key like 'admin:%' then raise exception 'Managed delivery revision is immutable'; end if; if TG_OP = 'DELETE' then return old; end if; return new; end; $$;`)
    this.addSql(`create trigger vintage_delivery_revision_immutable before update or delete on vintage_delivery_rule for each row execute function vintage_immutable_managed_revision();`)
  }
  async down(): Promise<void> {
    this.addSql('drop trigger if exists vintage_delivery_revision_immutable on vintage_delivery_rule;')
    this.addSql('drop function if exists vintage_immutable_managed_revision();')
    this.addSql('drop table if exists vintage_delivery_audit;')
    this.addSql('drop function if exists vintage_immutable_delivery_audit();')
    this.addSql('drop table if exists vintage_delivery_control;')
  }
}
