import { MessageEmbed } from 'discord.js';

const makeOwnCurrencyAddedMessage = (newCurrency: number) => {
    return new MessageEmbed()
        .setDescription(`Success! Your new balance is $${newCurrency}`)
        .setColor('DARK_GREEN');
}

export { makeOwnCurrencyAddedMessage };