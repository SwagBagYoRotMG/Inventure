import { Schema, model, Document, Types } from 'mongoose';

interface IGuild extends Document {
    id: String;
    name: String;
    xp: Number;
    currency: Number;
    allies: Number;
    enemies: Number;

    currentAdventure: Object;
    lastAdventure: Object;

    isCurrentlyAdventuring: Function;
    startAdventure: Function;
    stopAdventure: Function;
    cannotAdventure: Function;
}

const GuildSchema = new Schema({
    id: String,
    xp: {
        type: Number,
        default: 0,
    },
    currency: {
        type: Number,
        default: 0,
    },
    allies: {
        type: Number,
        default: 0,
    },
    enemies: {
        type: Number,
        default: 1000,
    },
    currentAdventure: {
        required: false,
        exists: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: null,
            enum: [null, 'battle'],
            required: false,
        },
    },
    lastAdventure: {
        required: false,
        timeEnded: Date,
        exists: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: null,
            enum: [null, 'battle'],
            required: false,
        },
    },
});

GuildSchema.methods.isCurrentlyAdventuring = function () {
    return this.currentAdventure.exists === true;
};

GuildSchema.methods.cannotAdventure = function () {
    // WIP
    return true;
    // return this.currentAdventure.exists === true;
};

GuildSchema.methods.startAdventure = function (type: String): Promise<any> {
    this.currentAdventure = {
        exists: true,
        type,
    };

    return this.save();
};

GuildSchema.methods.stopAdventure = function (): Promise<any> {
    this.timeEnded = Date.now();
    this.currentAdventure = {
        exists: false,
    };

    this.lastAdventure = {
        exists: true,
        type: this.currentAdventure.type,
    };

    return this.save();
};

const Guild = model<IGuild>('Guild', GuildSchema);

export { Guild, GuildSchema, IGuild };
