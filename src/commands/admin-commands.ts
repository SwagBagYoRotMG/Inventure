import BaseCommands from "./base-commands";

class AdminCommands extends BaseCommands {
    async clearAdventure() {
        // TODO check you are an admin

        if (this.guild.isCurrentlyAdventuring()) {
            this.guild.stopAdventure();
        }

        this.message.channel.send('Adventure has been reset.');
    }

}

export { AdminCommands };
