import { Schema, model } from 'mongoose';

const Guild = new Schema({
    id: String,
    name: String,
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
        messageId: String,
        type: {
            type: String,
            default: 'battle',
            enum: ['battle'],
        },
    },
    lastAdventure: {
        required: false,
        timeEnded: Date,
        type: {
            type: String,
            default: 'battle',
            enum: ['battle'],
        },
    },
});

const Monster = model('Guild', Guild);

export { Monster, Guild };
