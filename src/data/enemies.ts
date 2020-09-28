interface IEnemy {
    name: string,
    baseHp: number,
    basePersuasionResistance: number,
    image: string,
    prefix: string,
    battleDurationMinutes: number,
    type: 'monster' | 'boss',
}

const enemies = [
    <IEnemy>{
        name: 'Abyssal Demon 30hp',
        prefix: 'an',
        baseHp: 30,
        basePersuasionResistance: 180,
        image: 'https://www.maxpixel.net/static/photo/1x/Fire-Demon-Flames-Chaos-Burn-Inflamed-Devil-Hell-2708544.jpg',
        type: 'monster',
        battleDurationMinutes: 1,
    },
    <IEnemy>{
        name: 'Abyssal Demon 20hp',
        prefix: 'an',
        baseHp: 20,
        basePersuasionResistance: 180,
        image: 'https://www.maxpixel.net/static/photo/1x/Fire-Demon-Flames-Chaos-Burn-Inflamed-Devil-Hell-2708544.jpg',
        type: 'monster',
        battleDurationMinutes: 1,
    },
    <IEnemy>{
        name: 'Abyssal Demon 40hp',
        prefix: 'an',
        baseHp: 40,
        basePersuasionResistance: 180,
        image: 'https://www.maxpixel.net/static/photo/1x/Fire-Demon-Flames-Chaos-Burn-Inflamed-Devil-Hell-2708544.jpg',
        type: 'monster',
        battleDurationMinutes: 1,
    },
    <IEnemy>{
        name: 'Abyssal Demon 35hp',
        prefix: 'an',
        baseHp: 35,
        basePersuasionResistance: 180,
        image: 'https://www.maxpixel.net/static/photo/1x/Fire-Demon-Flames-Chaos-Burn-Inflamed-Devil-Hell-2708544.jpg',
        type: 'monster',
        battleDurationMinutes: 1,
    },
    <IEnemy>{
        name: 'Abyssal Demon 50hp',
        prefix: 'an',
        baseHp: 50,
        basePersuasionResistance: 180,
        image: 'https://www.maxpixel.net/static/photo/1x/Fire-Demon-Flames-Chaos-Burn-Inflamed-Devil-Hell-2708544.jpg',
        type: 'monster',
        battleDurationMinutes: 1,
    },
    <IEnemy>{
        name: 'Bronze Dragon',
        prefix: 'a',
        baseHp: 260,
        basePersuasionResistance: 250,
        image: 'https://cdn.pixabay.com/photo/2017/01/13/07/57/dragon-1976596_960_720.jpg',
        type: 'boss',
        battleDurationMinutes: 1,
    },
];

export { enemies, IEnemy };