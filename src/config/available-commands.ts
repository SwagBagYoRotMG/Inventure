import { AdminCommands } from '../commands/admin-commands';
import { AdventureCommands } from '../commands/adventure-commands';
import { GenericCommands } from '../commands/generic-commands';

export default {
    start: { class: GenericCommands, method: 'start' },
    stats: { class: GenericCommands, method: 'stats' },
    adventure: { class: AdventureCommands, method: 'adventure' },
    a: { class: AdventureCommands, method: 'adventure' },
    clear: { class: AdminCommands, method: 'clearAdventure' },
    givecur: { class: AdminCommands, method: 'giveCurrency' },
}
