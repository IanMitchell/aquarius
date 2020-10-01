import Firestore from '@google-cloud/firestore';
import Prisma from '@prisma/client';

const firestore = new Firestore({
  projectId: 'aquarius-90090',
  keyFilename: './packages/aquarius/.keyfile.json',
});
const prisma = new Prisma.PrismaClient();

async function migrateAnalytics() {
  try {
    console.log('\tMigrating Analytics');

    const recordList = await firestore.collection('analytics').get();
    await Promise.all(
      recordList.docs.map((record) => {
        const event = record.data();

        return prisma.analytic.create({
          data: {
            action: event.action,
            category: event.category,
            label: event.label,
            context: event.context,
            createdAt: event.date.toDate(),
          },
        });
      })
    );

    console.log('\tFinished Migrating Analytics');
  } catch (err) {
    console.error('Analytics Migration Error:');
    console.error(err);
  }
}

async function migrateGuildSettings() {
  try {
    console.log('\tMigrating Guild Settings');

    const recordList = await firestore.collection('guildSettings').get();
    await Promise.all(
      recordList.docs.map(async (record) => {
        const setting = record.data();

        console.log('\t\tCreating Setting Record');
        const guildSetting = await prisma.guildSetting.create({
          data: {
            guildId: record.id,
            mute: setting.mute || undefined,
          },
        });

        console.log('\t\tCreating Ignored Users');
        const users = await Promise.all(
          setting.ignoredUsers.map((entry) => {
            return prisma.ignoredUser.create({
              data: {
                userId: entry,
                guildSetting: {
                  connect: {
                    id: guildSetting.id,
                  },
                },
              },
            });
          })
        );

        console.log('\t\tCreating Enabled Commands');
        const commands = await Promise.all(
          setting.enabledCommands.map((cmd) => {
            return prisma.enabledCommand.create({
              data: {
                name: cmd,
                enabled: true,
                guildSetting: {
                  connect: {
                    id: guildSetting.id,
                  },
                },
              },
            });
          })
        );

        console.log('\t\tCreating Command Configs');
        return Promise.all(
          Object.keys(setting.commandConfig).map((name) => {
            const config = setting.commandConfig[name];

            return Promise.all(
              Object.entries(config).map(async ([key, value]) => {
                console.log(
                  `\t\t\t[${guildSetting.id}, ${name}, ${key}, ${value}]`
                );
                const cmd = await prisma.enabledCommand.findOne({
                  where: {
                    guildSettingId_name: {
                      guildSettingId: guildSetting.id,
                      name,
                    },
                  },
                });

                if (!cmd) {
                  return Promise.resolve();
                }

                return prisma.commandConfig.create({
                  data: {
                    key,
                    value,
                    command: {
                      connect: {
                        id: cmd.id,
                      },
                    },
                  },
                });
              })
            );
          })
        );
      })
    );

    console.log('\tFinished Migrating Guild Settings');
  } catch (err) {
    console.error('Guild Settings Migration Error:');
    console.error(err);
  }
}

async function migrateKarma() {
  try {
    console.log('\tMigrating Karma');

    const recordList = await firestore.collection('karma').get();
    await Promise.all(
      recordList.docs.map((record) => {
        const karma = record.data();

        return prisma.karma.create({
          data: {
            guildId: karma.guildId,
            userId: karma.userId,
            karma: karma.karma,
            lastUsage: new Date(karma.lastUsage),
          },
        });
      })
    );

    console.log('\tFinished Migrating Karma');
  } catch (err) {
    console.error('Karma Migration Error:');
    console.error(err);
  }
}

async function migrateLastSeen() {
  try {
    console.log('\tMigrating Last Seen');

    const recordList = await firestore.collection('lastSeen').get();
    await Promise.all(
      recordList.docs.map((record) => {
        const seen = record.data();

        return prisma.lastSeen.create({
          data: {
            userId: record.id,
            lastSeen: new Date(seen.lastSeen),
          },
        });
      })
    );

    console.log('\tFinished Migrating Last Seen');
  } catch (err) {
    console.error('Last Seen Migration Error:');
    console.error(err);
  }
}

async function migrateQuotes() {
  try {
    console.log('\tMigrating Quotes');

    const recordList = await firestore.collection('quotes').get();
    await Promise.all(
      recordList.docs.map((record) => {
        const quote = record.data();

        let date = new Date(quote.date);

        if (date.toString() === 'Invalid Date') {
          date = new Date(quote.date.toDate());
        }

        if (date.toString() === 'Invalid Date') {
          console.log(quote.date);
          date = new Date();
        }

        return prisma.quote.create({
          data: {
            guildId: quote.guildId,
            quote: quote.quote,
            quoteId: quote.quoteId,
            addedBy: quote.addedBy,
            channel: quote.channelName,
            createdAt: date,
          },
        });
      })
    );

    console.log('\tFinished Migrating Quotes');
  } catch (err) {
    console.error('Quotes Migration Error:');
    console.error(err);
  }
}

async function migrateReplies() {
  try {
    console.log('\tMigrating Replies');

    const recordList = await firestore.collection('replies').get();
    await Promise.all(
      recordList.docs.map((record) => {
        const reply = record.data();

        return prisma.reply.create({
          data: {
            guildId: reply.guildId,
            trigger: reply.trigger,
            response: reply.response,
          },
        });
      })
    );

    console.log('\tFinished Migrating Replies');
  } catch (err) {
    console.error('Reply Migration Error:');
    console.error(err);
  }
}

async function migrateServices() {
  try {
    console.log('\tMigrating Services');

    const recordList = await firestore.collection('services').get();
    await Promise.all(
      recordList.docs.map((record) => {
        const services = record.data();

        return Promise.all(
          Object.keys(services).map((service) =>
            prisma.service.create({
              data: {
                userId: record.id,
                name: service,
                values: services[service],
              },
            })
          )
        );
      })
    );
    console.log('\tFinished Migrating Services');
  } catch (err) {
    console.error('Services Migration Error:');
    console.error(err);
  }
}

async function migrateSettings() {
  try {
    console.log('\tMigrating Settings');

    const recordList = await firestore.collection('settings').get();
    await Promise.all(
      recordList.docs.map((record) => {
        const setting = record.data();

        return prisma.setting.create({
          data: {
            key: record.id,
            value: setting.value,
          },
        });
      })
    );

    console.log('\tFinished Migrating Settings');
  } catch (err) {
    console.error('Settings Migration Error:');
    console.error(err);
  }
}

console.log('Starting Migration...');

Promise.all([
  migrateAnalytics(),
  migrateGuildSettings(),
  migrateKarma(),
  migrateLastSeen(),
  migrateQuotes(),
  migrateReplies(),
  migrateServices(),
  migrateSettings(),
]).then(() => console.log('Finished Migration.'));
