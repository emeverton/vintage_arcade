import { Migration } from "@medusajs/framework/mikro-orm/migrations"
export class Migration20260920200300 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table if not exists "vintage_combo_command" ("id" text not null, "replay_key" text not null, "request_hash" text not null, "cart_id" text not null, "combo_id" text not null, "completed" boolean not null default false, "selection" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vintage_combo_command_pkey" primary key ("id"));')
    this.addSql('create unique index if not exists "vintage_combo_command_replay_key_unique" on "vintage_combo_command" ("replay_key") where "deleted_at" is null;')
    this.addSql('create index if not exists "vintage_combo_command_cart_id" on "vintage_combo_command" ("cart_id");')
  }
  async down(): Promise<void> { this.addSql('drop table if exists "vintage_combo_command";') }
}
