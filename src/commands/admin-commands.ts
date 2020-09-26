import { Player, IPlayer } from "../models/Player";
import BaseCommands from "./base-commands";


class AdminCommands extends BaseCommands {
    async clearAdventure() {
        // TODO check you are an admin

        if (this.guild.isCurrentlyAdventuring()) {
            this.guild.stopAdventure();
        }

        this.message.channel.send('Adventure has been reset.');
    }

    async giveCurrency(amount: number, username: string) {
        // TODO check you are an admin
        let cur = amount;
        const name = username;

        const id = await this.getPlayerID(name);
        if (id != null) {
            
            await id.player.setCurrency(cur, id);

            this.message.channel.send('Currency set!');

            return;
            }
        

        this.message.channel.send('Currency not set!');
        return;
    }

    private async getPlayerID(username: string) {
        
        const name = username;
        
        var doc =  await Player.findOne({ username: name }).exec();
        
        if(doc != null)
            {
                var playerID = doc.get('id');
                return playerID;
            }
        
        
            return;
        
    };
}

export { AdminCommands };
