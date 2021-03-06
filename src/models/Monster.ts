import { Schema, model } from 'mongoose';

const MonsterSchema = new Schema({
    name: String,
    type: {
        type: String,
        enum: ['monster', 'ascended', 'transcended', 'miniboss', 'boss'],
    },
    stats: {
        hp: {
            type: Number,
            default: 1,
        },
        magicDefence: {
            type: Number,
            default: 0,
        },
        attackDefence: {
            type: Number,
            default: 0,
        },
        charismaDefence: {
            type: Number,
            default: 0,
        },
        image: {
            type: String,
            default: 0,
        },
        luck: {
            type: Number,
            default: 0,
        },
    },
});

const Monster = model('Monster', MonsterSchema);

export { Monster, MonsterSchema };
