import { MessageEmbed, EmbedFieldData } from "discord.js";
import { workerData } from "worker_threads";
import { makeClassNotSelectedMessage } from "../messages/class-not-selected";
import { makeClassSelectedMessage } from "../messages/class-selected";
import { makeInsufficientFundsClassNotSelectedMessage } from "../messages/insufficient-funds-class-not-selected";
import { makeInvalidHeroclassMessage } from "../messages/invalid-heroclass";
import { makeStartMessage } from "../messages/start-message";
import { makeStatsMessage } from "../messages/stats";
import { Player, IPlayer } from '../models/Player';
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
            guildId: this.guild.get('id'),
            username: this.user.username,
        });

        player.save();

        this.message.channel.send(makeStartMessage(player.get('username')));
    }

    async stats(other?: string) {
        const player = await Player.findOne({ id: this.message.author.id }).exec();
        let playerID = other;

        const args = playerID?.replace(/[!@<>]/g,'');

        let otherPlayer = await Player.findOne({ id: args }).exec();

        if (!player) {
            return;
        }
        else if(other == null){
            this.message.channel.send(makeStatsMessage(player));
        }
        else if(other != null && otherPlayer){
            this.message.channel.send(makeStatsMessage(otherPlayer));
        }
        else
        return;
    }

    // Lets players select their Heroclass
    async selectHeroclass(heroclass: string) {
        let desiredClass = heroclass;
        
        const hero = await Player.findOne({ id: this.message.author.id }).exec();
        
        let currentLevel = await hero?.get('level');
        let heroID = await hero?.get('id');
        let desiredClassCaseFixed = await this.fixCase(desiredClass);
        let isValid = await this.checkForValidClass(desiredClassCaseFixed);

        let currentCurrency = await hero?.get('currency');
        let currentRebirths = await hero?.get('rebirths');

        let requiredAmount = (Number(currentRebirths) * Number('15000'));

        const hasEnoughMoney = await this.checkBalanceForHeroclass(currentCurrency, currentRebirths);
        
        // Checks if player exists in DB
        if (!hero) {
            return;
        }
        // Checks if player exists and is under level 10
        else if(hero && currentLevel < 10) {
            
            if(Number(currentRebirths) === Number(0))
            {
            this.message.channel.send(makeClassNotSelectedMessage(hero.get('username')));
            return;
            }

            else if((Number(currentRebirths) >= Number(1)) && isValid === true)
            {   
                if(hasEnoughMoney === true)
                {
                const payForClass = await Player.updateOne(  { "id": heroID}, // Filter
                {$set: {"currency": (Number(currentCurrency) - Number(requiredAmount))}}, // Update
                );    
                const changeClass = await Player.updateOne(  { "id": heroID}, // Filter
                {$set: {"class": desiredClassCaseFixed}}, // Update
                );
                this.message.channel.send(makeClassSelectedMessage(hero.get('username'), desiredClassCaseFixed));
                return;
                }
                else
                {
                this.message.channel.send(makeInsufficientFundsClassNotSelectedMessage(hero.get('username'), requiredAmount));
                }
              return;
            }
            else{
                this.message.channel.send(makeInvalidHeroclassMessage(hero.get('username')));  
            }
        }
        
        // Checks if player is atleast level 10 and input a valid class
        else if(currentLevel >= 10 && isValid === true)
        {
            if(hasEnoughMoney === true)
            {
                const payForClass = await Player.updateOne(  { "id": heroID}, // Filter
                {$set: {"currency": (Number(currentCurrency) - Number(requiredAmount))}}, // Update
                );   
                const changeClass = await Player.updateOne(  { "id": heroID}, // Filter
                {$set: {"class": desiredClassCaseFixed}}, // Update
                );
            this.message.channel.send(makeClassSelectedMessage(hero.get('username'), desiredClassCaseFixed));
            return;
            }
            else
            {
                this.message.channel.send(makeInsufficientFundsClassNotSelectedMessage(hero.get('username'), requiredAmount));
            }
        }
        
        // Catches any players over level 10 that input an invalid class
        else {
            this.message.channel.send(makeInvalidHeroclassMessage(hero.get('username')));
            return;
        }

    }

    // Takes any string and fixes the case so that only the first letter is Uppercase for display and proper DB storage.
    private async fixCase(word: string){
        let preCase = word;
        let lowerCase = preCase.toLowerCase();
        let fixedCase = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
        return fixedCase;

        }

    private async checkForValidClass(word: string){
        let isValid = new Boolean;
        let input = word;

        if( input ==  "Berzerker" || input ==  "Wizard" || input ==  "Ranger" || input ==  "Cleric" )
        {
            isValid = true;
            return isValid;
        }
        else
        {
            isValid = false;
            return isValid;
        }

    }
    private async checkBalanceForHeroclass(currency: number, rebirths: number){
        let hasEnough = new Boolean;
        let bal = currency;
        let rb = rebirths;
        let necessary = (Number(rb) * Number('15000'));

        if(bal >= necessary)
        {
            hasEnough = true;
            return hasEnough;
        }
        else if(bal < necessary)
        {
            hasEnough = false;
            return hasEnough;
        }
    }    
    
}

export { GenericCommands };
