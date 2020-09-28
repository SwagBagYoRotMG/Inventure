import { MessageEmbed } from 'discord.js';

const makeRebirthsChangedMessage = (newRebirthLevel: number, id?: string) => {
    return new MessageEmbed()
        .setDescription(`Success! ${id} now has ${newRebirthLevel} rebirths!`)
        .setColor('DARK_GREEN');
}

export { makeRebirthsChangedMessage };