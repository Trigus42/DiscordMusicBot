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
exports.registerDiscordEventListeners = void 0;
const Discord = __importStar(require("discord.js"));
const Embeds = __importStar(require("../embeds/index"));
function registerDiscordEventListeners(clients, config) {
    const mainClient = clients[0].discord;
    mainClient.on("messageCreate", async (message) => {
        var _a, _b;
        try {
            // Ignore messages from bots and webhooks
            if (message.author.bot || message.webhookId)
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
            // Get command
            const command = (_a = config.commands.get(commandName)) !== null && _a !== void 0 ? _a : config.commands.find(command => command.aliases.includes(commandName));
            if (!command)
                return;
            // Get pair of client and distube for the members voice channel or use a new pair if member is in a new voice channel
            let clientArray = (_b = clients.find(i => i.distube.getQueue(message.guildId) ? // Check if client has a queue
                i.distube.getQueue(message.guildId).voiceChannel.id === message.member.voice.channel.id : false // Check if client queue is in the same voice channel as the message author
            )) !== null && _b !== void 0 ? _b : clients.find(i => // If no client has been found, use a new client
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
            // Check if command can be executed in the current state
            if (command.adminOnly && !message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                Embeds.embedBuilderMessage(client, message, "RED", "❌ You don't have permission for this Command");
                return;
            }
            else if (command.guildOnly && !message.guild) {
                Embeds.embedBuilderMessage(client, message, "RED", "❌ This Command can only be used in a server");
                return;
            }
            else if (command.ownerOnly && !(message.author.id === config.userConfig.ownerId)) {
                Embeds.embedBuilderMessage(client, message, "RED", "❌ You don't have permission for this Command");
                return;
            }
            else if (command.cooldown > 0) {
                if (message.author.id in command.cooldowns) {
                    const expirationTime = command.cooldowns[message.author.id];
                    if (expirationTime > Date.now()) {
                        const timeLeft = (expirationTime - Date.now()) / 1000;
                        Embeds.embedBuilderMessage(client, message, "RED", `❌ You can use this command again in ${timeLeft.toFixed(1)} seconds`);
                        return;
                    }
                }
                else {
                    command.cooldowns[message.author.id] = Date.now() + command.cooldown;
                }
            }
            else if (command.needsQueue && !queue) {
                Embeds.embedBuilderMessage(client, message, "RED", `❌ There is nothing playing in the queue`);
                return;
            }
            else if (command.needsArgs && !args.length) {
                Embeds.embedBuilderMessage(client, message, "RED", `❌ You didn't provide any arguments for the ${command.name} command`);
                return;
            }
            // Execute command
            command.execute(message, args, client, distube, config);
        }
        catch (error) {
            console.error(error);
        }
    });
    // React to messages mentioning other clients than the main client
    clients.slice(1).forEach(client => {
        client.discord.on("messageCreate", async (message) => {
            const prefix = await config.getPrefix(message.guild.id);
            if (message.mentions.members.has(client.discord.user.id)) {
                message.reply({ embeds: [new Discord.MessageEmbed().setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setDescription(`My Prefix is "${prefix}". To get started; type ${prefix}help`)] });
            }
        });
    });
}
exports.registerDiscordEventListeners = registerDiscordEventListeners;
