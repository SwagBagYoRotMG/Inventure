import { makeAdventureNotResetMessage } from "../messages/adventure-not-reset";
import { makeAdventureResetMessage } from "../messages/adventure-reset";
import { makeBannedMessage } from "../messages/banned";
import { makeCooldownsResetMessage } from "../messages/cooldowns-reset";
import { makeCurrencyAddedMessage } from "../messages/currency-added";
import { makeAdminMessage } from "../messages/is-admin";
import { makeLevelChangedMessage } from "../messages/level-changed";
import { makeNotAdminMessage } from "../messages/not-admin";
import { makeOwnCurrencyAddedMessage } from "../messages/own-currency-added";
import { makeOwnLevelChangedMessage } from "../messages/own-level-changed";
import { makeOwnRebirthsChangedMessage } from "../messages/own-rebirths-changed";
import { makeOwnXPLevelChangedMessage } from "../messages/own-xp-level-changed";
import { makeRebirthsChangedMessage } from "../messages/rebirths-changed";
import { makeUnbannedMessage } from "../messages/unbanned";
import { makeXPLevelChangedMessage } from "../messages/xp-level-changed";
import { Player, IPlayer } from "../models/Player";
import BaseCommands from "./base-commands";

class AdminCommands extends BaseCommands {
    private async adminCheck() {
        // TODO check you are an admin
        const commandUser = this.message.author.id;

        let adminFindDoc = await Player.findOne({ id: commandUser }).exec();
        let adminCheckDoc = await adminFindDoc?.get('admin');
        var isAdmin = new Boolean();

        if (await adminCheckDoc === true) {
            isAdmin = true;
            return isAdmin;
        }

        else{
            isAdmin = false;
            return isAdmin;
        }
    }

    // Makes any player an administrator with -makeadmin [@username] ?[password] (Password is optional. If you are already an admin you don't need to enter it.)
    async makeAdmin(id: string, password?: string) {

        if(await this.adminCheck() === true && id == null)
        {
            this.message.channel.send('Oops! Looks like you forgot to include the username of the player you are promoting! Please try again with -makeadmin [@username]');
            return;
        }

        let pass = password;
        let playerID = id;

        const author = await this.message.author.username;

        const args = playerID.replace(/[!@<>]/g,'');

        if (await this.adminCheck() === true || pass === 'abc123') {

            const change = await Player.updateOne(  { "id": args}, // Filter
            {$set: {"admin": true}}, // Update
            );

            this.message.channel.send(makeAdminMessage(id));
            return;
         }
         else{
            this.message.channel.send(makeNotAdminMessage(author));
         }

    }

    async ban(id: string) {

        if(await this.adminCheck() === true && id == null)
        {
            this.message.channel.send('Oops! Looks like you forgot to include the username being banned! Please try again with -ban [@username]');
            return;
        }

        let playerID = id;


        const author = await this.message.author.username;

        const args = playerID.replace(/[!@<>]/g,'');

        if (await this.adminCheck() === true) {

            const change = await Player.updateOne(  { "id": args}, // Filter
            {$set: {"banned": true}}, // Update
            );

            this.message.channel.send(makeBannedMessage(id));
            return;
         }
         else{
            this.message.channel.send(makeNotAdminMessage(author));
         }

    }

    async unban(id: string) {

        if(await this.adminCheck() === true && id == null)
        {
            this.message.channel.send('Oops! Looks like you forgot to include the username being un-banned! Please try again with -unban [@username]');
            return;
        }

        let playerID = id;

        const author = await this.message.author.username;

        const args = playerID.replace(/[!@<>]/g,'');

        if (await this.adminCheck() === true) {

            const change = await Player.updateOne(  { "id": args}, // Filter
            {$set: {"banned": false}}, // Update
            );

            this.message.channel.send(makeUnbannedMessage(id));
            return;
         }
         else{
            this.message.channel.send(makeNotAdminMessage(author));
         }

    }

    // Clears any adventure currently on the board
    async clearAdventure() {
        
        const author = await this.message.author.username;

        if (await this.adminCheck() === true){

            if (this.guild.isCurrentlyAdventuring()) {
                this.guild.stopAdventure();
                this.message.channel.send(makeAdventureResetMessage());
            }
            else{
                this.message.channel.send(makeAdventureNotResetMessage());
            }
            
        }
        else{
            this.message.channel.send(makeNotAdminMessage(author));
        }

        
    }

    // Give any player currency using -addcur [amount] [@username]
    async addCurrency(amount: number, id?: string) {
     
        let cur = amount;
        let playerID = id;

        const author = await this.message.author.username;
        const authorID = await this.message.author.id;
   
        const args = playerID?.replace(/[!@<>]/g,'');

        let currentDoc = await Player.findOne({ id: args }).exec();
        let currentCurrency = await currentDoc?.get('currency');

        let myCurrentDoc = await Player.findOne({ id: authorID }).exec();
        let myCurrentCurrency = await myCurrentDoc?.get('currency');
        let myNewCurrency = Number(myCurrentCurrency) + Number(cur);

            if(await this.adminCheck() === true && amount == null)
            {
                this.message.channel.send('Oops! Looks like you forgot to include the currency amount! Please try again with -addcur [amount] [@username]');
                return;
            }

            if (await this.adminCheck() === true && id != null)
            {
                const change = await Player.updateOne(  { "id": args}, // Filter
                {$set: {"currency": Number(cur) + Number(currentCurrency)}}, // Update
                );

                let newDoc = await Player.findOne({ id: args }).exec();
                let newCurrency = await newDoc?.get('currency');

                this.message.channel.send(makeCurrencyAddedMessage(id, newCurrency));
                return;
            }

            if (await this.adminCheck() === true && id == null)
            {
                const change = await Player.updateOne(  { "id": authorID}, // Filter
                {$set: {"currency": myNewCurrency}}, // Update
                );

                let newDoc = await Player.findOne({ id: authorID }).exec();
                let newCurrency = await newDoc?.get('currency');

                this.message.channel.send(makeOwnCurrencyAddedMessage(newCurrency));
                return;
            }

            else{
                this.message.channel.send(makeNotAdminMessage(author));
                return;
            }
    }

    // Change any players Level
    async changeLevel(level: number, id?: string) {
         
        let desiredLevel = level;
        let playerID = id;

        const author = await this.message.author.username;
        const authorID = await this.message.author.id;
   
        const args = playerID?.replace(/[!@<>]/g,'');

        let currentDoc = await Player.findOne({ id: args }).exec();
        let currentLevel = await currentDoc?.get('level');

            if(await this.adminCheck() === true && level == null)
            {
                this.message.channel.send('Oops! Looks like you forgot to include the desired level! Please try again with -changelevel [level] [@username]');
                return;
            }

            if (await this.adminCheck() === true && id != null)
            {
                const change = await Player.updateOne(  { "id": args}, // Filter
                {$set: {"level": desiredLevel}}, // Update
                );

                let newDoc = await Player.findOne({ id: args }).exec();
                let newLevel = await newDoc?.get('level');

                this.message.channel.send(makeLevelChangedMessage(id, newLevel));
                return;
            }

            if (await this.adminCheck() === true && id == null)
            {
                const change = await Player.updateOne(  { "id": authorID}, // Filter
                {$set: {"level": desiredLevel}}, // Update
                );

                let newDoc = await Player.findOne({ id: authorID }).exec();
                let newLevel = await newDoc?.get('level');

                this.message.channel.send(makeOwnLevelChangedMessage(newLevel));
                return;
            }

            else{
                this.message.channel.send(makeNotAdminMessage(author));
                return;
            }
    }

       // Sets any users xp amount using input method -setxp [amount] [@username]
       async setExperience(amount: number, id?: string){

        let xpAmount = amount;
        let playerID = id;

        const args = playerID?.replace(/[!@<>]/g,'');
        const author = await this.message.author.username;
        const authorID = await this.message.author.id;

        if(await this.adminCheck() === true && amount == null)
        {
            this.message.channel.send('Oops! Looks like you forgot to include the XP amount! Please try again with -setxp [amount] [@username]');
            return;
        }

        //Checks if admin & second argument (@username) is included
        if (await this.adminCheck() === true && id != null){
            const change = await Player.updateOne(  { "id": args}, // Filter
            {$set: {"experience": xpAmount}}, // Update
            );

            let newDoc = await Player.findOne({ id: args }).exec();
            let newXPLevel = await newDoc?.get('experience');

            this.message.channel.send(makeXPLevelChangedMessage(id, newXPLevel));
            return;

        }

        //Checks if no second argument (@username) is included, then changes the command user's XP by default
        if (await this.adminCheck() === true && id == null){
            const change = await Player.updateOne(  { "id": authorID}, // Filter
            {$set: {"experience": xpAmount}}, // Update
            );

            let newDoc = await Player.findOne({ id: authorID }).exec();
            let newXPLevel = await newDoc?.get('experience');

            this.message.channel.send(makeOwnXPLevelChangedMessage(newXPLevel));
            return;

        }
        else{
            this.message.channel.send(makeNotAdminMessage(author));
            return;
        }

    }

        // Gives x amount of XP to any player using input method -givexp [amount] [@username]
        async giveExperience(amount: number, id?: string){

            let xpAmount = amount;
            let playerID = id;
    
            const args = playerID?.replace(/[!@<>]/g,'');
            const author = await this.message.author.username;
            const authorID = await this.message.author.id;
            
            if(await this.adminCheck() === true && amount == null)
            {
                this.message.channel.send('Oops! Looks like you forgot to include the XP amount! Please try again with -givexp [amount] [@username]');
                return;
            }
            //Checks if admin & second argument (@username) is included
            if (await this.adminCheck() === true && id != null){
    
                let newOther = await Player.findOne({ id: args }).exec();
                let otherCurrentXP = await newOther?.get('experience');
                const newOtherXP = Number(otherCurrentXP) + Number(xpAmount);
    
                const change = await Player.updateOne(  { "id": args}, // Filter
                {$set: {"experience": newOtherXP}}, // Update
                );
    
                let newDoc = await Player.findOne({ id: args }).exec();
                let newXPLevel = await newDoc?.get('experience');
    
                this.message.channel.send(makeXPLevelChangedMessage(id, newXPLevel));
                return;
    
            }
    
            //Checks if no second argument (@username) is included, then changes the command user's XP by default
            if (await this.adminCheck() === true && id == null){
    
                const currentPlayer = await Player.findOne({ id: authorID }).exec();
                const currentXP = await currentPlayer?.get('experience');
                const newXP = Number(currentXP) + Number(xpAmount);
    
                const change = await Player.updateOne(  { "id": authorID}, // Filter
                {$set: {"experience": newXP}}, // Update
                );
    
                let newDoc = await Player.findOne({ id: authorID }).exec();
                let newXPLevel = await newDoc?.get('experience');
    
                this.message.channel.send(makeOwnXPLevelChangedMessage(newXPLevel));
                return;
    
            }
            else{
                this.message.channel.send(makeNotAdminMessage(author));
                return;
            }
    
        }

    // Change any players rebirth level
    async changeRebirths(level: number, id?: string) {
        
        let desiredRebirthLevel = level;
        let playerID = id;

        const author = await this.message.author.username;
        const authorID = await this.message.author.id;
        const args = playerID?.replace(/[!@<>]/g,'');

        let currentDoc = await Player.findOne({ id: args }).exec();
        let currentLevel = await currentDoc?.get('rebirths');

            if(await this.adminCheck() === true && level == null)
            {
                this.message.channel.send('Oops! Looks like you forgot to include the rebirth amount! Please try again with -changerebirths [level] [@username]');
                return;
            }

            if (await this.adminCheck() === true && id == null)
            {
                const change = await Player.updateOne(  { "id": authorID}, // Filter
                {$set: {"rebirths": desiredRebirthLevel}}, // Update
                );

                let newDoc = await Player.findOne({ id: authorID }).exec();
                let newRebirthLevel = await newDoc?.get('rebirths');

                this.message.channel.send(makeOwnRebirthsChangedMessage(newRebirthLevel));
                return;
            }

            if (await this.adminCheck() === true)
            {
                const change = await Player.updateOne(  { "id": args}, // Filter
                {$set: {"rebirths": desiredRebirthLevel}}, // Update
                );

                let newDoc = await Player.findOne({ id: args }).exec();
                let newRebirthLevel = await newDoc?.get('rebirths');

                this.message.channel.send(makeRebirthsChangedMessage(newRebirthLevel, id));
                return;
            }
            else{
                this.message.channel.send(makeNotAdminMessage(author));
                return;
            }

    }

    // Reset all cooldowns (UNFINISHED)
    async resetCooldowns() {
        


        const author = await this.message.author.username;
   

            if (await this.adminCheck() === true)
            {
                const change = await Player.updateMany(  { "hasUsedAbility": true}, // Filter
                {$set: {"hasUsedAbility": false}}, // Update
                );

                this.message.channel.send(makeCooldownsResetMessage());
                return;
            }
            else{
                this.message.channel.send(makeNotAdminMessage(author));
                return;
            }

    }

}

export { AdminCommands };
