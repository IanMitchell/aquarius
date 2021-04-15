-- CreateTable
CREATE TABLE "Reminder" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder.time_index" ON "Reminder"("time");

-- CreateIndex
CREATE INDEX "Reminder.guildId_userId_index" ON "Reminder"("guildId", "userId");
