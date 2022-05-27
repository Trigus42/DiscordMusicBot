"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueCommand = void 0;
const Discord = __importStar(require("discord.js"));
class QueueCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'queue',
            description: 'Show the current queue',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        let queue = distube.getQueue(message);
        if (!queue) {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
            return;
        }
        const { author, channel } = message;
        const queue_embeds = Embeds.queueEmbed(queue, client);
        const guilds = [...client.guilds.cache.values()];
        const embedMessage = await queue.textChannel.send({
            embeds: [queue_embeds[0]],
            components: queue_embeds.length < 2 ? [] : [new Discord.MessageActionRow({ components: [
                        BUTTONS.nextButton
                    ] })]
        });
        // Exit if there is only one page of guilds (no need for all of this)
        if (queue_embeds.length < 1)
            return;
        // Collect button interactions
        const collector = embedMessage.createMessageComponentCollector();
        let currentIndex = 0;
        collector.on("collect", async (interaction) => {
            try {
                // Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
                interaction.deferUpdate();
                // Increase/decrease index
                interaction.customId === BUTTONS.backButton.customId ? (currentIndex -= 1) : (currentIndex += 1);
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
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
}
exports.QueueCommand = QueueCommand;