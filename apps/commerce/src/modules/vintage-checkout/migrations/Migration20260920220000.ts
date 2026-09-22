import { Migration } from "@medusajs/framework/mikro-orm/migrations"
export class Migration20260920220000 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table if not exists "vintage_preview_session" ("id" text not null, "token_hash" text not null, "cart_id" text null, "order_id" text null, "expires_at" timestamptz not null, "quote" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vintage_preview_session_pkey" primary key ("id"));')
    this.addSql('create unique index if not exists "vintage_preview_session_token_unique" on "vintage_preview_session" ("token_hash") where "deleted_at" is null;')
    this.addSql('create index if not exists "vintage_preview_session_expiry" on "vintage_preview_session" ("expires_at");')
  }
  async down(): Promise<void> { this.addSql('drop table if exists "vintage_preview_session";') }
}
