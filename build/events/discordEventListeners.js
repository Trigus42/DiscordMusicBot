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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDiscordEventListeners = void 0;
const Discord = __importStar(require("discord.js"));
const queue_1 = __importDefault(require("../commands/queue"));
const Embeds = __importStar(require("../embeds/index"));
function registerDiscordEventListeners(clientPairs, config) {
    clientPairs.forEach(receivingClientPair => {
        receivingClientPair.discord.on("messageCreate", async (message) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Ignore messages from bots and webhooks
            if (message.author.bot || message.webhookId)
                return;
            // If the message is from a guild, check if this client is the main client
            if (message.guild && clientPairs.length > 1 && !(config.userConfig.mainClientId === ((_a = message.client.user) === null || _a === void 0 ? void 0 : _a.id)))
                return;
            // Get guild prefix if message is in guild; For DMs use default prefix
            let prefix;
            if (message.guild) {
                prefix = await config.getPrefix(message.guild.id);
            }
            else {
                prefix = config.userConfig.prefix;
            }
            // Ignore messages that don't start with the prefix or mention the bot
            if (((_b = receivingClientPair.discord.user) === null || _b === void 0 ? void 0 : _b.id) && ((_c = message.mentions.members) === null || _c === void 0 ? void 0 : _c.has(receivingClientPair.discord.user.id))) {
                message.reply({ embeds: [new Discord.MessageEmbed().setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setDescription(`My Prefix is "${prefix}". To get started; type ${prefix}help`)] });
                return;
            }
            else if (!message.content.startsWith(prefix))
                return;
            // Extract command name and arguments from message
            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const commandName = args.shift();
            // Get command
            if (!commandName)
                return;
            const command = (_d = config.commands.get(commandName)) !== null && _d !== void 0 ? _d : config.commands.find(command => command.aliases.includes(commandName));
            if (!command)
                return;
            // Check if the command can be used in the current context
            if (command.guildOnly && !message.guild) {
                Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "❌ This Command can only be used in a server" });
                return;
            }
            else if (command.ownerOnly && !(message.author.id === config.userConfig.ownerId)) {
                Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "❌ You don't have permission for this Command" });
                return;
            }
            else if ((command.needsUserInVC || command.needsQueue) && !((_e = message.member) === null || _e === void 0 ? void 0 : _e.voice.channel)) {
                Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "❌ You need to be in a voice channel to use this Command" });
                return;
            }
            else if (command.needsArgs && !args.length) {
                Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: `❌ You didn't provide any arguments for the ${command.name} command` });
                return;
            }
            else if (command.cooldown > 0) {
                if (message.author.id in command.cooldowns) {
                    const expirationTime = command.cooldowns[message.author.id];
                    if (expirationTime > Date.now()) {
                        const timeLeft = (expirationTime - Date.now()) / 1000;
                        Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: `❌ You can use this command again in ${timeLeft.toFixed(1)} seconds` });
                        return;
                    }
                }
                else {
                    command.cooldowns[message.author.id] = Date.now() + command.cooldown;
                }
            }
            // Guilds
            if (message.guildId) {
                // Check if command can be executed in the current state
                if (command.adminOnly && !((_f = message.member) === null || _f === void 0 ? void 0 : _f.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))) {
                    Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "❌ You don't have permission for this Command" });
                    return;
                }
                else if (command.needsQueue && !queue_1.default) {
                    Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: `❌ There is nothing playing in the queue` });
                    return;
                }
                // If this command needs the client to be in a voice channel, get an available client
                if (command.needsUserInVC) {
                    // Get pair of client and distube for the members voice channel or use a new pair if member is in a new voice channel
                    let chosenClientPair = (_g = clientPairs.find(clientPair => {
                        var _a, _b;
                        return clientPair.distube.getQueue(message.guildId) ? // Check if client has a queue
                            ((_b = (_a = clientPair.distube.getQueue(message.guildId)) === null || _a === void 0 ? void 0 : _a.voiceChannel) === null || _b === void 0 ? void 0 : _b.id) === message.member.voice.channel.id : false;
                    } // Check if client queue is in the same voice channel as the message author
                    )) !== null && _g !== void 0 ? _g : clientPairs.find(clientPair => // If no client has been found, use a new client
                     !clientPair.distube.getQueue(message.guildId) // Check if client has no queue
                        && clientPair.discord.guilds.fetch().then(guilds => guilds.has(message.guildId)) // Check if client is in the same guild as the message author
                    );
                    if (!chosenClientPair) {
                        Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "❌ There are no available clients", description: "Please try again later or free up one of the clients" });
                        return;
                    }
                    let queue = chosenClientPair.distube.getQueue(message.guildId);
                    // Switch queue channel if new command is sent in different text channel
                    if (queue) {
                        queue.textChannel = message.channel;
                    }
                    command.execute(message, args, chosenClientPair.discord, chosenClientPair.distube, config);
                    // If this command doesn't need the client to be in a voice channel, just use the main client to execute the command
                }
                else {
                    command.execute(message, args, receivingClientPair.discord, receivingClientPair.distube, config);
                }
                // DMs
            }
            else {
                let discord = message.client;
                let distube = (_h = clientPairs.find(clientPair => clientPair.discord === discord)) === null || _h === void 0 ? void 0 : _h.distube;
                command.execute(message, args, discord, distube, config);
            }
        });
    });
}
exports.registerDiscordEventListeners = registerDiscordEventListeners;
