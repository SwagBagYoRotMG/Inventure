import { EmbedFieldData } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { CurrentAdventure } from "../commands/adventure-commands"
import { IEnemy } from "../interfaces/enemy"
import { PlayerResult } from "../commands/adventure-commands"
const makeAdventureResults = (won: boolean, enemy: IEnemy, absoluteDamge: number, allPlayerResults: PlayerResult[]) => {
    let color = 'DARK_GREEN';

    let desc = [
        `The group killed the ${enemy.name} (${absoluteDamge}/${enemy.baseHp}).`,
        `TODO: Make this clever`,
    ];

    if (!won) {
        color = 'DARK_RED';

        desc = [
            `The group got killed (${absoluteDamge}/${enemy.baseHp}).`,
            `TODO: Make this clever`,
        ];
    }
    // \n💥 Bonus Damage: 301
    return new MessageEmbed()
        .setColor(color) // WIN/LOSE colours
        .setDescription(desc.join('\n'))
        .addFields([
            <EmbedFieldData>{
                name: `${allPlayerResults[0].player.username}`,
                value: `🎲 Rolled a ${allPlayerResults[0].roll}\n⚔️ Damage: ${allPlayerResults[0].baseDamage}\n Total Damage:${allPlayerResults[0].totalDamage}`,
                inline: true,
            },
            // Bonus Damage Not Added Yet
            <EmbedFieldData>{
                name: `${allPlayerResults[1].player.username}`,
                value: `🎲 Rolled a ${allPlayerResults[1].roll}\n⚔️ Damage: ${allPlayerResults[1].baseDamage}\n Total Damage:${allPlayerResults[1].totalDamage}`,
                inline: true,
            },
        ]);
}

export { makeAdventureResults };
