import { MessageEmbed } from 'discord.js';

const makeOwnLevelChangedMessage = (newLevel: number) => {
    return new MessageEmbed()
        .setDescription(`Success! Your new level is ${newLevel}`)
        .setColor('DARK_GREEN');
}

export { makeOwnLevelChangedMessage };