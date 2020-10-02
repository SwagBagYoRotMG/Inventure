import { Message, CollectorFilter, Collection, MessageReaction, User, MessageEmbed } from "discord.js";
import BaseCommands from "./base-commands";
import { differenceInMilliseconds } from 'date-fns';
import { makeCanAdventureMessage } from "../messages/can-adventure";
import { makeCannotAdventureMessage } from "../messages/cannot-adventure";
import { makeCurrentlyAdventuringMessage } from "../messages/currently-adventuring";
import { makeAdventureBattleMessage } from "../messages/adventure-battle";
import { makeTimeRemainingMessage } from "../messages/time-remaining";
import { makeAdventureResults } from "../messages/adventure-results";
import { IArea } from "../areas/base-area";
import { IBoss, IEnemy } from "../interfaces/enemy";
import { makeStandardMessage } from "../messages/standard-message";
import { makeAdventureInProgressMessage } from "../messages/adventure-in-progress";
import { makeSummonBossConfirmationMessage } from "../messages/summon-boss-confirmation";
import { makeSummonBossMessage } from "../messages/summon-boss";
import { makeErrorMessage } from "../messages/error";
import { makeSuccessMessage } from "../messages/success";
import { makeLockedMessage } from "../messages/locked";
import { makeCannotSummonBossMessage } from "../messages/cannot-summon-boss";
import { IPlayer, Player } from "../models/Player"
import { AdventureResult } from "../models/AdventureResult"
import { promises } from "fs";
import { id } from "date-fns/locale";
import { stringify } from "querystring";


interface CurrentAdventure {
    reactions: Collection<String, MessageReaction> | null,
    enemy: IEnemy,
    durationInMiliseconds: number
}

interface PlayerResult {
    player: IPlayer,
    action: string,
    roll: number,
    baseDamage: number,
    critDamage: number,
    totalDamage: number,

    // Can add 'fumbled', 'crit' etc to this later
}

interface PlayerAttack {
    roll: number,
    baseDamage: number,
    critDamage: number,
}

class AdventureCommands extends BaseCommands {
    async adventure() {
        if (this.guild.isLocked) {
            return await this.message.channel.send(makeLockedMessage());
        }

        const now = new Date;

        if (!this.guild.canAdventure(now)) {
            const cooldown = this.guild.getAdventureCooldown();
            const timer = differenceInMilliseconds(cooldown, now);

            const cooldownMessage = await this.message.channel.send(makeCannotAdventureMessage(cooldown, now));

            setTimeout(() => {
                cooldownMessage.edit(makeCanAdventureMessage());
            }, timer);

            return;
        }

        await this.guild.lock();

        const adventure: CurrentAdventure | null = await this.startAdventure();

        if (!adventure || !adventure.reactions) {
        return;
        }

        await this.handleEndOfAdventure(adventure);

        this.guild.unlock();
    }

    private async startAdventure(): Promise<CurrentAdventure | null> {
        const area: IArea | null = this.guild.getCurrentArea();

        if (!area) {
            this.message.channel.send('Oops, it doesn\'t look like you are in an area. Travel somewhere with the `-area` command');
            return null;
        }

        const enemy: IEnemy = area.getRandomEnemy();

        return this.awaitReactionsToBattle(enemy, area, () => {
        return makeAdventureBattleMessage(area, enemy, this.message.author.username);
        });
    }

    private async awaitReactionsToBattle(enemy: IEnemy | IBoss, area: IArea, messageCallback: CallableFunction): Promise<CurrentAdventure | null> {
        const userReactions: Array<any> = [];
        
        const adventureEmojisFilter: CollectorFilter = async (reaction, user) => {
          
            if (user.bot) {
                return true;
            }
            let idNoSymbols = user.id.replace(/[!@<>]/g, '');

            const player: IPlayer | null = await Player.findOne({ id: idNoSymbols }).exec();
            
            
            const usersLastReaction = userReactions[user.id];
            
            
            if (usersLastReaction) {
                await usersLastReaction.users.remove(user.id);
            }
    

            if (!player) {
                await reaction.users.remove(idNoSymbols);
                let thisUser = user;
                 console.log(user);
  
                thisUser.send(`Whoops! It doesn't look like you've started your adventure yet. Use -start to begin!`);
                
                
            }

            userReactions[user.id] = reaction;

            // TODO: Check player has "started". If they haven't remove their reaction and DM them
            // TODO: Handle the case where a player removes their own emoji

            return true;
        };

        const message: Message = await this.message.channel.send(messageCallback());

        message.react('⚔️');
        message.react('✨');
        message.react('🗣');
        message.react('🏃‍♂️');

        const duration = enemy.battleDurationMinutes;

        const timerMessage: Message = await this.message.channel.send(makeTimeRemainingMessage(`${duration}m 00s`, 'DARK_GREEN'));

        await this.countdownMinutes(duration,
            (timeRemaining: string, color: string) => {
                timerMessage.edit(makeTimeRemainingMessage(timeRemaining, color));
            },
            () => {
                timerMessage.delete();
            }
        );

         const durationInMiliseconds = duration * 60000;
        // const durationInMiliseconds = 0.1 * 60000;
        const reactions = await message.awaitReactions(adventureEmojisFilter, { time: durationInMiliseconds });

        message.delete();

        return <CurrentAdventure>{
            reactions,
            enemy,
            durationInMiliseconds
        };
        
    }

    async handleEndOfAdventure(adventure: CurrentAdventure) {
        if (!adventure.reactions) {
            return null;
        }
        const allPlayerResults: Array<PlayerResult> = [];
 

        let count = 0;

        var all = new Promise(resolve => {
        adventure.reactions?.forEach(async (reaction: MessageReaction, emoji: String) => {
            const totalReactions = reaction?.count || 0;
            
            // Ignore the bot's reaction
            if (totalReactions <= 1) {
                return;
            }
            
            const users = reaction.users.cache.filter((user: any): boolean => {
                return !user.bot;
            }).array();

            let action = 'attack';

            if ('⚔️' === emoji) {
                action = 'attack';
            } 

            if ('✨' === emoji) {
                action = 'spell';
            } 
            if ('🏃‍♂️' === emoji) {
                action = 'run';
            }
            
            
            const playerResults = await Promise.all(users.map(async (user : User) : Promise <PlayerResult> => {
            const player: IPlayer | null = await Player.findOne({ id: user.id }).exec();

            // Find the player somehow. Will look something like this...
                const playerAttack : PlayerAttack = player?.attackEnemy(adventure.enemy, action);
                      
                return <PlayerResult>{
                    player,
                    action,
                    roll: playerAttack.roll,
                    baseDamage: playerAttack.baseDamage,
                    critDamage: playerAttack.critDamage,
                    totalDamage: playerAttack.baseDamage + playerAttack.roll,
                };
                
            }));  
        allPlayerResults.push(...playerResults);
        //console.log(allPlayerResults);    

        count = (count + 1);
        console.log(count);
        console.log(totalReactions);
        if (count === (totalReactions))
        {
            resolve();
        }  


        });
    });
        await Promise.all([all]);  
        console.log(allPlayerResults);
        

        // TODO: Make sure we only count one reaction from each user
        
        // GET BASE ATTACK

        // let damage = attackingUsers.
        
        let absoluteDamage = 0;

        for (let i = 0; i < allPlayerResults.length; i++) {
            absoluteDamage += allPlayerResults[i].totalDamage; 
          }

        let won = false;
        

        const reactions = await { time: adventure.durationInMiliseconds };

        if(absoluteDamage >= adventure.enemy.baseHp)
        {
        won = true;    
        const adventureResultsMessageWin = makeAdventureResults(won, adventure.enemy, absoluteDamage, allPlayerResults);
        this.message.channel.send(adventureResultsMessageWin);
        
        for (let i = 0; i < allPlayerResults.length; i++) {

            const thisPlayer: IPlayer = allPlayerResults[i].player;
            // console.log(thisPlayer);

            thisPlayer.postBattleXp(thisPlayer, adventure.enemy); 
        }
        //const result = new AdventureResult({
        //    damage: absoluteDamage,
        //    totalParticipants: allPlayerResults.length,
        //    wasSuccessful: true,
        //});
        //await result.save();
        } 
         

        if(absoluteDamage < adventure.enemy.baseHp)
        {
        won = false;
        const adventureResultsMessageLose = makeAdventureResults(won, adventure.enemy, absoluteDamage, allPlayerResults);    
        this.message.channel.send(adventureResultsMessageLose);    
        // const result = new AdventureResult({
        //    damage: absoluteDamage,
        //    totalParticipants: allPlayerResults.length,
        //    wasSuccessful: false,
        // });
        //await result.save();
        }
        
        const isMiniBoss = true;

        if (won && isMiniBoss) {
            await this.guild.giveQuestItemForCurrentArea();

            // TODO, pass this in
            const currentArea = this.guild.getCurrentArea();
            const questItems = this.guild.getQuestItemsForCurrentArea();

            if (this.guild.hasEnoughQuestItemsForBossInCurrentArea()) {
                this.message.channel.send(makeSuccessMessage(`Congratulations! You have collected enough ${currentArea.questItem} quest items (${questItems}/${currentArea.totalQuestItemsNeeded}). You may summon the area boss by using \`-boss\`.`));
            } else {
                this.message.channel.send(makeStandardMessage(`The enemy dropped one ${currentArea.questItem}. You now have (${questItems}/${currentArea.totalQuestItemsNeeded}) ${currentArea.name} quest items.`));
            }
        }

        return this.guild.startAdventureCooldown();

        // TODO: End battle (update data in Guild model)

        // TODO: Handle rewards & losses
        
}

    async summonAreaBoss() {
        const area: IArea | null = this.guild.getCurrentArea();

        if (!area) {
            this.message.channel.send(makeErrorMessage('Sorry, you are not currently in any area'));
            return;
        }

        if (this.guild.isLocked) {
            this.message.channel.send(makeLockedMessage());
            return;
        }

        if (!this.guild.hasEnoughQuestItemsForBossInCurrentArea()) {
            this.message.channel.send(makeErrorMessage(`You have not collected enough ${area.questItem} quest items in ${area.name}. You currently have (${this.guild.getQuestItemsForCurrentArea()}/${area.totalQuestItemsNeeded})`));
            return;
        }

        const now = new Date;

        if (!this.guild.canSummonAreaBoss(now)) {
            const cooldown = this.guild.getAreaBossCooldown();

            this.message.channel.send(makeCannotSummonBossMessage(cooldown, now));
            return;
        }

        if (!this.guild.canAdventure(now)) {
            const cooldown = this.guild.getAdventureCooldown();
            const timer = differenceInMilliseconds(cooldown, now);

            const cooldownMessage = await this.message.channel.send(makeCannotAdventureMessage(cooldown, now));

            setTimeout(() => {
                cooldownMessage.edit(makeCanAdventureMessage());
            }, timer);

            return;
        }

        await this.guild.lock();

        const secondsToWait = 45;

        await this.message.channel.send(makeSummonBossMessage(this.message.author.username, area));

        const message: Message = await this.message.channel.send(makeSummonBossConfirmationMessage(area, `${secondsToWait}s`));

        await this.countdownSeconds(secondsToWait,
            (timeRemaining: string) => {
                message.edit(makeSummonBossConfirmationMessage(area, timeRemaining));
            },
            () => {
                message.delete();
            }
        );

        message.react('✅');
        message.react('❌');

        const userReactions: Array<any> = [];

        const emojiFilter: CollectorFilter = async (reaction, user) => {
            if (user.bot) {
                return true;
            }

            const usersLastReaction = userReactions[user.id];

            if (usersLastReaction) {
                await usersLastReaction.users.remove(user.id);
            }

            userReactions[user.id] = reaction;

            // TODO: Check player has "started". If they haven't remove their reaction and DM them
            // TODO: Handle the case where a player removes their own emoji

            return true;
        };

        const reactions = await message.awaitReactions(emojiFilter, { time: secondsToWait * 1000 });

        const approveList: Array<User> = [];
        const denyList: Array<User> = [];

        reactions.forEach((reaction: MessageReaction, emoji: String) => {
            const totalReactions = reaction?.count || 0;

            // Ignore the bot's reaction
            if (totalReactions <= 1) {
                return;
            }

            const users = reaction.users.cache.filter((user: any): boolean => {
                return !user.bot;
            }).array();

            if ('✅' === emoji) {
                approveList.push(...users);
            } else if ('❌' === emoji) {
                denyList.push(...users);
            }
        });

        if (denyList.length > 0 || approveList.length === 0) {
            this.message.channel.send(makeErrorMessage(`You decided not to summon the area boss this time around. Probably a wise decision.`));
            this.guild.unlock();

            return;
        }

        await this.guild.useQuestItemsForCurrentArea();

        // START BOSS FIGHT
        const enemy = area.getBoss();

        const fightReactions = await this.awaitReactionsToBattle(enemy, area, () => {
            const desc = [
                `On the other side of some thick undergrowth, you notice a small reservoir with the moon reflecting off the surface. You slowly walk forward when you start to hear the sound of bones grinding and clunking...`,
                `You turn to look in the direction of the noise and see what looks like lightning charging up in the trees. As it charges up, the light starts to reveal a skeleton of a dragon. But it's moving... You realise that lightning bolt is being charged from its mouth and is aimed right at you!`,
                `You quickly turn and start to run and narrowly dive out of the way of the lightning blast.`,
                `As much as you didn't want to believe it, the rumours were right. **Dracolich** is back. This must be the Saint's doing. But why? What is he doing here?`,
                ``,
                `What will you do? You have ${enemy.battleDurationMinutes} minutes to decide.`,
                ``,
                `React with:`,
                `**Fight (⚔️)** - **Spell (✨)** - **Persuade (🗣)** - **Run (🏃‍♂️)**`,
            ];

            return new MessageEmbed()
                .setTitle(enemy.name)
                .setColor(area.bossColor)
                .setDescription(desc.join('\n'))
                .setFooter(`${enemy.name} is particularlly resistant to magic attacks, and he's in no mood to talk.`)
                .setImage(enemy.image);
        });

        console.log(fightReactions);
        console.log('TODO: Determin battle results');
        // END BOSS FIGHT

        await this.guild.startAreaBossCooldown();
        await this.guild.unlock();
    }
}

export { AdventureCommands, PlayerAttack, CurrentAdventure, PlayerResult };
