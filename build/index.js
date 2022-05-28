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
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const createClients_1 = require("./clients/createClients");
const distubeEventListeners_1 = require("./events/distubeEventListeners");
const discordEventListeners_1 = require("./events/discordEventListeners");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Create config object
const config = new config_1.Config();
start();
function start() {
    main().catch((error) => {
        console.log(error);
        start();
    });
}
async function main() {
    // Create discord.js and distube client pairs
    const clientPairs = await (0, createClients_1.createClients)(config);
    // Read commands from commands directory
    config.commands = new discord_js_1.Collection();
    let commandsPath = path.join(__dirname, 'commands');
    let commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    for (let file of commandFiles) {
        let filePath = path.join(commandsPath, file);
        let command = (await Promise.resolve().then(() => __importStar(require(filePath)))).default;
        if (!command.enabled)
            return;
        config.commands.set(command.name, command);
    }
    (0, distubeEventListeners_1.registerDistubeEventListeners)(clientPairs, config);
    (0, discordEventListeners_1.registerDiscordEventListeners)(clientPairs, config);
}
