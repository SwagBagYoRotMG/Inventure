import { MessageEmbed } from 'discord.js';

const makeOwnXPLevelChangedMessage = (newXPLevel: number) => {
    return new MessageEmbed()
        .setDescription(`Success! Your new experience amount is ${newXPLevel}`)
        .setColor('DARK_GREEN');
}

export { makeOwnXPLevelChangedMessage };