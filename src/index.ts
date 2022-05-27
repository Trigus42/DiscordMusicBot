import { Collection } from "discord.js"
import { Command } from "./classes/command"
import { Config } from "./config"
import { createClients } from "./clients/createClients"
import { registerDistubeEventListeners } from "./events/distubeEventListeners"
import { registerDiscordEventListeners } from "./events/discordEventListeners"
import * as fs from "fs"
import * as path from "path"

// Create config object
const config = new Config()

start()

function start(): void {
    main().catch((error) => {
        console.log(error)
        start()
    })
}

async function main(): Promise<void> {
    // Create discord.js and distube client pairs
    const clients = await createClients(config)

    // Read commands from commands directory
    config.commands = new Collection() as Collection<string, Command>
    let commandsPath = path.join(__dirname, 'commands');
    let commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

    for (let file of commandFiles) {
        let filePath = path.join(commandsPath, file);
        let command = (await import(filePath)).default as Command
        if (!command.enabled) return
        config.commands.set(command.name, command)
    }

    registerDistubeEventListeners(clients, config)
    registerDiscordEventListeners(clients, config)
}