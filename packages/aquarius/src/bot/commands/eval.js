const { inspect } = require('util')

export const info = {
    name: 'eval',
    description: 'Evaluates javascript code.',
    usage: '```@Aquarius eval <code>```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
    aquarius.onCommand(/^eval/i, async (message) => {
        try {
            let evaled = eval(`(async () => {${message.content.replace(/^eval ?/i, '').replace(/```(js)?/g, '')}}`);

            if (typeof evaled !== "string") evaled = inspect(evaled);

            message.channel.send(`\`\`\`xl\n${evaled}\n\`\`\``);
        } catch (err) {
            message.channel.send(`\`\`\`xl\n${err}\n\`\`\``);
        }

        analytics.trackUsage('eval', message);
    });
};
