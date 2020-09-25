import { Message, User } from "discord.js";
import { IGuild } from "../../models/Guild";

export default abstract class BaseCommands {
    protected user: User;

    constructor(protected message: Message, protected guild: IGuild) {
        this.user = message.author;
    }
}
