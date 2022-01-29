import * as Discord from "discord.js"

export const BUTTONS : { [name: string]: Discord.MessageButton } = {
    next_Button: new Discord.MessageButton({
        style: 'SECONDARY',
        emoji: '⏭',
        customId: 'tracknext'
    }),

    back_Button: new Discord.MessageButton({
        style: 'SECONDARY',
        emoji: '⏮️',
        customId: 'trackback'
    }),

    play_pause_Button: new Discord.MessageButton({
        style: 'SECONDARY',
        emoji: '⏯️',
        customId: 'playpause'
    }),

    stop_Button: new Discord.MessageButton({
        style: 'SECONDARY',
        emoji: '⏹',
        customId: 'stop'
    }),

    lower_volume_Button: new Discord.MessageButton({
        style: 'SECONDARY',
        emoji: '🔉',
        customId: 'lower_volume'
    }),

    raise_volume_Button: new Discord.MessageButton({
        style: 'SECONDARY',
        emoji: '🔊',
        customId: 'raise_volume'
    }),

    seek_forward_Button: new Discord.MessageButton({
        style: 'SECONDARY',
        emoji: '▶️',
        customId: 'seek_forward'
    }),

    seek_backward_Button: new Discord.MessageButton({
        style: 'SECONDARY',
        emoji: '◀️',
        customId: 'seek_backward'
    })
}