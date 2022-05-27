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
exports.registerMessageListener = void 0;
const Discord = __importStar(require("discord.js"));
const Embeds = __importStar(require("../embeds/index"));
function registerMessageListener(clients, config, commands) {
    const mainClient = clients[0].discord;
    mainClient.on("messageCreate", async (message) => {
        var _a;
        try {
            // Ignore messages from bots, webhooks, and DMs
            if (message.author.bot || message.webhookId || !message.guild)
                return;
            const prefix = await config.getPrefix(message.guild.id);
            // Ignore messages that don't start with the prefix or mention the bot
            if (message.mentions.members.has(mainClient.user.id)) {
                message.reply({ embeds: [new Discord.MessageEmbed().setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setDescription(`My Prefix is "${prefix}". To get started; type ${prefix}help`)] });
            }
            else if (!message.content.startsWith(prefix))
                return;
            // Get the command name and arguments
            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const commandName = args.shift();
            // Check if the command exists
            if (!commands.has(commandName))
                return;
            // Get pair of client and distube for the members voice channel or use a new pair if member is in a new voice channel
            let clientArray = (_a = clients.find(i => i.distube.getQueue(message.guildId) ? // Check if client has a queue
                i.distube.getQueue(message.guildId).voiceChannel.id === message.member.voice.channel.id : false // Check if client queue is in the same voice channel as the message author
            )) !== null && _a !== void 0 ? _a : clients.find(i => // If no client has been found, use a new client
             !i.distube.getQueue(message.guildId) // Check if client has no queue
                && i.discord.guilds.fetch().then(guilds => guilds.has(message.guildId)) // Check if client is in the same guild as the message author
            );
            if (!clientArray) {
                Embeds.embedBuilderMessage(mainClient, message, "RED", "❌ There are no available clients", "Please try again later or free up one of the clients");
                return;
            }
            let client = clientArray.discord;
            let distube = clientArray.distube;
            let queue = distube.getQueue(message.guild.id);
            // Switch queue channel if new command is sent in different text channel
            if (queue) {
                queue.textChannel = message.channel;
            }
            // Execute command
            const command = commands.get(commandName);
            command.execute(message, args, client, distube);
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.registerMessageListener = registerMessageListener;
