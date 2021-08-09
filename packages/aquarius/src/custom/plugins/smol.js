// TODO: ban smol
/**
 * import discord
import os


SCREENSHOT_HEIGHT = 800
SCREENSHOT_WIDTH = 1200

STRIKES_BEFORE_BAN = 3


bot = discord.Client()
strikes = 0


@bot.event()
async def on_message(message: discord.Message) -> None:
    global strikes
    if message.guild is None or message.guild.id != 815369174096412692:
        return

    if message.author != 744517607239057479:
        return

    for attachment in message.attachments:
        height = attachment.height
        width = attachment.width

        if height is not None and height == SCREENSHOT_HEIGHT and\
           width is not None and width == SCREENSHOT_WIDTH:
            await message.delete()
            strikes += 1

    if strikes == STRIKES_BEFORE_BAN:
        await message.author.ban(reason='C-R-O-P')
        strikes = 0


bot.run(os.getenv('TOKEN'))
 */

import getLogger from "../../core/logging/log";

const log = getLogger("smol");

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: "smol",
  hidden: true,
  description: "Crop.",
  //   permissions: [Permissions.FLAGS.MANAGE_NICKNAMES],
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius }) => {};
