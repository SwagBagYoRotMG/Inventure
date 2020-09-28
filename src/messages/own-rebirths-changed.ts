import { MessageEmbed } from 'discord.js';

const makeOwnRebirthsChangedMessage = (newRebirthLevel: number) => {
    return new MessageEmbed()
        .setDescription(`Success! You now have ${newRebirthLevel} rebirths!`)
        .setColor('DARK_GREEN');
}

export { makeOwnRebirthsChangedMessage };