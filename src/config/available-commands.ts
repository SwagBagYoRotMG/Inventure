import { AdventureCommands } from '../core/commands/adventure-commands';
import { GenericCommands } from '../core/commands/generic-commands';

export default {
    start: { class: GenericCommands, method: 'start' },
    stats: { class: GenericCommands, method: 'stats' },
    adventure: { class: AdventureCommands, method: 'adventure' },
    a: { class: AdventureCommands, method: 'adventure' },
}
