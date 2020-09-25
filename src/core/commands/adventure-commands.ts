import { Message, MessageEmbed, EmbedFieldData, User, CollectorFilter, Collection, MessageReaction } from "discord.js";
import { textChangeRangeIsUnchanged } from "typescript";
import { Guild } from "../../models/Guild";
import { Player } from '../../models/Player';
import { Reply } from "../Reply";
import BaseCommands from "./base-commands";

class AdventureCommands extends BaseCommands {
    // stats([first, last]: [string?, string?]) {
    // Example parameters
    // }

    async adventure() {
        if (this.guild.isCurrentlyAdventuring()) {
            return await this.message.channel.send('There is already a battle taking place.');
        }

        if (this.guild.cannotAdventure()) {
            return await this.message.channel.send(`No heroes are ready to depart in an adventure. Try again in 22 seconds`);
        }

        const reactions = await this.startAdventure();

        await this.handleEndOfAdventure(reactions);
    }

    private async startAdventure(): Promise<Collection<String, MessageReaction>> {
        this.guild.startAdventure('battle');

        // TODO: Actually pick a random monster

        const reply = new Reply({
            type: 'text',
            body: [
                `The path ahead winds down into a valley below. **${this.message.author.username}** is excited to go see what could be found, but a plagued Ascended Jade Drake just landed in front of you glaring!`,
                ``,
                `What will you do and will other heroes be brave enough to help you?`,
                ``,
                `Heroes have 2 minutes to participate via reaction:`,
                ``,
                `React with:`,
                `**Fight (⚔️)** - **Spell (✨)** - **Talk (🗣)** - **Pray (🙏)** - **Run (🏃‍♂️)**`,
            ]
        });

        const userReactions: Array<any> = [];

        const adventureEmojisFilter: CollectorFilter = async (reaction, user) => {
            if (user.bot) {
                return true;
            }

            const usersLastReaction = userReactions[user.id];

            if (usersLastReaction) {
                await usersLastReaction.users.remove(user.id);
            }

            userReactions[user.id] = reaction;

            // TODO: Check player has "started". If they haven't remove their reaction and DM them

            return true;
        };

        const embed = new MessageEmbed()
            .setTitle(`You feel adventurous: ${this.message.author.username}?`)
            .setColor('DARK_GOLD')
            .setDescription(reply.getContent())
            .setImage('https://upload.wikimedia.org/wikipedia/commons/d/d8/Friedrich-Johann-Justin-Bertuch_Mythical-Creature-Dragon_1806.jpg');


        const message: Message = await this.message.channel.send(embed);

        message.react('⚔️');
        message.react('✨');
        message.react('🗣');
        message.react('🙏');
        message.react('🏃‍♂️');

        // TODO: Use the time duration from the monster
        const timerMessage: Message = await this.message.channel.send('⏳ Time remaining: **1m 00s**');
        await this.countdownMinutes(1, timerMessage);

        // 2 mins = 120000
        const reactions = await message.awaitReactions(adventureEmojisFilter, { time: 60000 });

        message.delete();

        return reactions;
    }

    handleEndOfAdventure(reactions: Collection<String, MessageReaction>) {
        console.log(reactions);
        const reply = new Reply({
            type: 'text',
            body: [
                `The group killed the Ascended Cave Lion (1,267/892).`,
                `TODO: Make this clever`,
            ],
        });

        // TODO: Be clever about this. There's a limit of 25 "fields". So we may want to just put this into
        const embed = new MessageEmbed()
            .setColor('DARK_GREEN') // WIN/LOSE colours
            .setDescription(reply.getContent())
            .addFields([
                <EmbedFieldData>{
                    name: 'tmoze315',
                    value: `🎲 Rolled a 20\n⚔️ Damage: 400`,
                    inline: true,
                },
                <EmbedFieldData>{
                    name: 'YoItsBK',
                    value: `🎲 Rolled a 20\n⚔️ Damage: 400\n💥 Bonus Damage: 301`,
                    inline: true,
                },
            ]);

        this.message.channel.send(embed);

        return this.guild.stopAdventure();

        // TODO: End battle (update data in Guild model)

        // TODO: Handle rewards & losses
    }

    // https://gist.github.com/adhithyan15/4350689
    countdownMinutes(minutes: number, message: Message) {
        let seconds: number = 60;
        let mins: number = minutes;

        const tick = () => {
            var currentMinutes = mins - 1

            seconds--;

            if (seconds % 5 === 0) {
                const remainingTime = `${currentMinutes.toString()}m ${(seconds < 10 ? 0 : '')}${seconds}s`;
                message.edit(`⏳ Time remaining: **${remainingTime}**`);
            }

            if (seconds > 0) {
                setTimeout(tick, 1000);
            } else {
                if (currentMinutes > 1) {
                    this.countdownMinutes(currentMinutes - 1, message);
                } else if (currentMinutes <= 0 && seconds <= 0) {
                    return message.delete();
                }
            }
        }

        tick();
    }

    async stats() {
        // TODO: Actually make stats pull from player data
        const reply = new Reply({
            type: 'text',
            body: [
                `A level **104 Berserker**`,
                `Berserkers have the option to **rage** and add big bonuses to attacks, but fumbles hurt. Use the rage command when attacking in an adventure.`,
                ``,
                `\`\`\`js`,
                `Rebirths: 15`,
                `Max Level: 115`,
                `\`\`\``,
            ],
        });

        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle(`Character Sheet for: ${this.message.author.username}`)
            .setFooter(`Active bonus: ( 0  | 0  | 0  | 0  | 2  )\nStats: 0% | EXP: 40% | Credits: 0%`)
            // Set the color of the embed
            .setColor('DARK_NAVY')
            // Set the main content of the embed
            .setDescription(reply.getContent())
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

export { AdventureCommands };
