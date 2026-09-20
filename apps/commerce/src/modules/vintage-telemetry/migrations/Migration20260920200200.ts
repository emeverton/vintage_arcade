import { Migration } from "@medusajs/framework/mikro-orm/migrations"
export class Migration20260920200200 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table if not exists "vintage_commerce_event" ("id" text not null, "event_id" text not null, "event_name" text not null, "order_id" text not null, "payload" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vintage_commerce_event_pkey" primary key ("id"));')
    this.addSql('create unique index if not exists "vintage_commerce_event_event_id_unique" on "vintage_commerce_event" ("event_id") where "deleted_at" is null;')
  }
  async down(): Promise<void> { this.addSql('drop table if exists "vintage_commerce_event";') }
}
