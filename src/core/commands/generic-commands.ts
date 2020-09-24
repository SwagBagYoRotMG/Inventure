import { Message, MessageEmbed, EmbedFieldData, User } from "discord.js";
import { Player } from '../../models/Player';
import BaseCommands from "./base-commands";

class GenericCommands extends BaseCommands {
    // stats([first, last]: [string?, string?]) {
    // Example parameters
    // }

    async start() {
        let player = await Player.findOne({ id: this.user.id }).exec();

        if (player) {
            this.message.channel.send('Looks like you have already started your adventure!');

            return;
        }

        player = new Player({
            id: this.user.id,
            username: this.user.username,
        });

        player.save();

        this.message.channel.send(`Welcome to Inventure, ${player.get('username')}`);
    }

    async stats() {
        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle(`Character Sheet for: ${this.message.author.username}`)
            .setFooter(`Active bonus: ( 0  | 0  | 0  | 0  | 2  )\nStats: 0% | EXP: 40% | Credits: 0%`)
            // Set the color of the embed
            .setColor('DARK_NAVY')
            // Set the main content of the embed
            .setDescription(`A level **104 Berserker**

            Berserkers have the option to **rage** and add big bonuses to attacks, but fumbles hurt. Use the rage command when attacking in an adventure.

            \`\`\`js
Rebirths: 15
Max Level: 115
\`\`\`
`)
            .addFields([
                <EmbedFieldData>{
                    name: 'Stats',
                    value: `• Attack: **243** [+53]\n• Charisma: **122** [+0]\n• Intelligence: **124** [+2]`,
                    inline: true,
                },
                <EmbedFieldData>{
                    name: 'Attributes',
                    value: `• Dexterity: **109**\n• Luck: **139**`,
                    inline: true,
                },
            ]);

        this.message.channel.send(embed);
    }
}

export { GenericCommands };
