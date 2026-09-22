import { Migration } from "@medusajs/framework/mikro-orm/migrations"
export class Migration20260920200100 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table if not exists "vintage_combo_definition" ("id" text not null, "revision_key" text not null, "name" text not null, "definition" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vintage_combo_definition_pkey" primary key ("id"));')
    this.addSql('create unique index if not exists "vintage_combo_definition_revision_key_unique" on "vintage_combo_definition" ("revision_key") where "deleted_at" is null;')
  }
  async down(): Promise<void> { this.addSql('drop table if exists "vintage_combo_definition";') }
}
