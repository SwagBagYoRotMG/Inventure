import { makeAdventureInProgressMessage } from "../messages/adventure-in-progress";
import { makeClassNotSelectedMessage } from "../messages/class-not-selected";
import { makeClassSelectedMessage } from "../messages/class-selected";
import { makeErrorMessage } from "../messages/error";
import { makeInsufficientFundsClassNotSelectedMessage } from "../messages/insufficient-funds-class-not-selected";
import { makeInvalidHeroclassMessage } from "../messages/invalid-heroclass";
import { makeStandardMessage } from "../messages/standard-message";
import { makeStartMessage } from "../messages/start-message";
import { makeRebirthSuccessMessage } from "../messages/rebirth-success";
import { makeRebirthFailureMessage } from "../messages/rebirth-failure";
import { makeStatsMessage } from "../messages/stats";
import { Player, IPlayer } from '../models/Player';
import BaseCommands from "./base-commands";

class GenericCommands extends BaseCommands {
    // stats([first, last]: [string?, string?]) {
    // Example parameters
    // }

    async start() {
        const player: IPlayer | null = await Player.findOne({ id: this.user.id }).exec();

        if (player) {
            this.message.channel.send('Looks like you have already started your adventure!');

            return;
        }

        const newPlayer = new Player({
            id: this.user.id,
            guildId: this.guild.get('id'),
            username: this.user.username,
        });

        newPlayer.save();

        this.message.channel.send(makeStartMessage(newPlayer.get('username')));
    }

    async rebirth() {
        let targetPlayerId = this.message.author.id;
        const player: IPlayer | null = await Player.findOne({ id: targetPlayerId }).exec();
        console.log(player);

        if (!player){
            this.message.channel.send('Player not found. Please try again');
            return;
        }
        const able = await player.rebirth(targetPlayerId);

        if(able === true)
        {
            this.message.channel.send(makeRebirthSuccessMessage(player.username,player.maxLevel));
            return;
        }
        else
        {
            this.message.channel.send(makeRebirthFailureMessage(player.username,player.maxLevel));
        }
        
    }

    async stats(playerId?: string) {
        let targetPlayerId = this.message.author.id;

        if (playerId) {
            targetPlayerId = playerId?.replace(/[!@<>]/g, '');
        }

        const player: IPlayer | null = await Player.findOne({ id: targetPlayerId }).exec();

        if (!player) {
            this.message.channel.send('Player not found. Please try again');
            return;
        }

        this.message.channel.send(makeStatsMessage(player));
    }

    // Lets players select their Heroclass
    async selectHeroclass(heroclass: string) {
        if (this.guild.isLocked) {
            this.message.channel.send(makeErrorMessage(`You cannot do that right now.`));
            return;
        }

        const player: IPlayer | null = await Player.findOne({ id: this.message.author.id }).exec();

        if (!player) {
            this.message.channel.send('Player not found. Please try again');
            return;
        }

        if (player.get('level') < 10 && player.get('rebirths') < 2) {
            this.message.channel.send(makeClassNotSelectedMessage(player.get('username')));

            return;
        }

        const currentCurrency = player.get('currency');
        const costToChangeHeroClass = player.get('rebirths') * 15000;

        if (currentCurrency < costToChangeHeroClass) {
            this.message.channel.send(makeInsufficientFundsClassNotSelectedMessage(player.get('username'), costToChangeHeroClass));
            return;
        }

        try {
            await player.setHeroClass(heroclass);

            this.message.channel.send(makeClassSelectedMessage(player.get('username'), player.get('class')));
        } catch (exception) {
            this.message.channel.send(makeInvalidHeroclassMessage(player.get('username')));
        }
    }
}

export { GenericCommands };
