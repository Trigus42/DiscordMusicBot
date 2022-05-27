import * as Embeds from '../embeds'

export class AutoplayCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'autoplay',
            description: 'Toggle autoplay',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        await Embeds.embedBuilderMessage(interaction.client, interaction.message, "#fffff0", `Autoplay is now ${distube.toggleAutoplay(message) ? "ON" : "OFF"}`)
            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
        message.react("✅")
        return
    }
}