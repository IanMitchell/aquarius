-- CreateTable
CREATE TABLE "last_seen" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karma" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "karma" INTEGER NOT NULL DEFAULT 0,
    "lastUsage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "replies" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linked_services" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "addedBy" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots" (
    "id" SERIAL NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_settings" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "mute" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enabled_commands" (
    "id" SERIAL NOT NULL,
    "guildSettingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command_configs" (
    "id" SERIAL NOT NULL,
    "commandId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ignored_users" (
    "id" SERIAL NOT NULL,
    "guildSettingId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytic_events" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_bans" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "last_seen.userId_unique" ON "last_seen"("userId");

-- CreateIndex
CREATE INDEX "last_seen.userId_index" ON "last_seen"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "karma.guildId_userId_unique" ON "karma"("guildId", "userId");

-- CreateIndex
CREATE INDEX "karma.guildId_userId_index" ON "karma"("guildId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "replies.guildId_trigger_unique" ON "replies"("guildId", "trigger");

-- CreateIndex
CREATE INDEX "replies.guildId_trigger_index" ON "replies"("guildId", "trigger");

-- CreateIndex
CREATE UNIQUE INDEX "linked_services.userId_name_unique" ON "linked_services"("userId", "name");

-- CreateIndex
CREATE INDEX "linked_services.userId_name_index" ON "linked_services"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "settings.key_unique" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings.key_index" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "quotes.guildId_quoteId_unique" ON "quotes"("guildId", "quoteId");

-- CreateIndex
CREATE INDEX "quotes.guildId_index" ON "quotes"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "guild_settings.guildId_unique" ON "guild_settings"("guildId");

-- CreateIndex
CREATE INDEX "guild_settings.guildId_index" ON "guild_settings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "enabled_commands.guildSettingId_name_unique" ON "enabled_commands"("guildSettingId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "command_configs.commandId_key_unique" ON "command_configs"("commandId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ignored_users.guildSettingId_userId_unique" ON "ignored_users"("guildSettingId", "userId");

-- CreateIndex
CREATE INDEX "analytic_events.action_index" ON "analytic_events"("action");

-- CreateIndex
CREATE UNIQUE INDEX "guild_bans.guildId_unique" ON "guild_bans"("guildId");

-- CreateIndex
CREATE INDEX "guild_bans.guildId_index" ON "guild_bans"("guildId");

-- AddForeignKey
ALTER TABLE "enabled_commands" ADD FOREIGN KEY ("guildSettingId") REFERENCES "guild_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "command_configs" ADD FOREIGN KEY ("commandId") REFERENCES "enabled_commands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ignored_users" ADD FOREIGN KEY ("guildSettingId") REFERENCES "guild_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
