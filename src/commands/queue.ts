import * as Discord from "discord.js"

export class QueueCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'queue',
            description: 'Show the current queue',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        let queue = distube.getQueue(message)

        if (!queue) {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
            return
        }

        const {author, channel} = message
        const queue_embeds = Embeds.queueEmbed(queue, client)
        const guilds = [...client.guilds.cache.values()]

        const embedMessage = await queue.textChannel.send({
            embeds: [queue_embeds[0]],
            components: queue_embeds.length < 2 ? [] : [new Discord.MessageActionRow({components: [
                BUTTONS.nextButton
            ]})]
        })

        // Exit if there is only one page of guilds (no need for all of this)
        if (queue_embeds.length < 1) return

        // Collect button interactions
        const collector = embedMessage.createMessageComponentCollector()

        let currentIndex = 0
        collector.on("collect", async (interaction: any) => {
            try {
                // Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
                interaction.deferUpdate()
                // Increase/decrease index
                interaction.customId === BUTTONS.backButton.customId ? (currentIndex -= 1) : (currentIndex += 1)
                // Respond to interaction by updating message with new embed
                embedMessage.edit({
                    embeds: [queue_embeds[currentIndex]],
                    components: [
                        new Discord.MessageActionRow({
                            components: [
                                // back button if it isn't the start
                                ...(currentIndex ? [BUTTONS.backButton] : []),
                                // forward button if it isn't the end
                                ...(currentIndex + 1 < queue_embeds.length ? [BUTTONS.nextButton] : [])
                            ]
                        })
                    ]
                })
            } catch (error) {
                console.error(error)
            }
        })
    }
}