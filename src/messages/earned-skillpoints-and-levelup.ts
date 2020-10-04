import { EmbedFieldData } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { IBoss, IEnemy } from "../interfaces/enemy";
import { PlayerResult } from "../commands/adventure-commands";
import { EarnedSkillpoints } from "../models/Player";

const makeEarnedSkillpoints = (allSkillpointRewards: EarnedSkillpoints[]) => {

    let desc = [
        `Use them wisely.`,
        
    ];

    

    // \n💥 Bonus Damage: 301
    let embed = new MessageEmbed()
        .setTitle(`Congratulations on achieving a new level, here are your skillpoints!`)
        .setColor('DARK_GREEN') // WIN/LOSE colours
        .setDescription(desc.join('\n'))
    for (let i = 0; i < allSkillpointRewards.length; i++) {
        
        let end = 's!';

        if (allSkillpointRewards[i].totalSkillpoints === 1){
            end = '!';         
        }
        console.log(allSkillpointRewards[i].totalSkillpoints);
        embed.addFields(
            <EmbedFieldData>{
                name: `${allSkillpointRewards[i].player.username}`,
                value: `🌟 Your new level is **${allSkillpointRewards[i].level}**, and you've earned **${allSkillpointRewards[i].totalSkillpoints}** Skillpoint${end}`,
                inline: false,
            },
            // Bonus Damage Not Added Yet
        )

    }
    return embed;
}

export { makeEarnedSkillpoints };
