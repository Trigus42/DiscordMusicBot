import { Collection } from "discord.js"
import { Command } from "./classes/command"
import { Config } from "./config"
import { createClients } from "./clients/createClients"
import { registerDistubeEventListeners } from "./events/distubeEventListerners"
import { registerMessageListener as registerDiscordEventListeners } from "./events/messageListener"
import * as fs from "fs"
import * as path from "path"

// Create config object
const config = new Config()

main().catch((error) => {
    config.db.close().then(() => {
        console.error(error)}).then(() => {
            process.exit(1)})}
    )

async function main(): Promise<void> {
    // Create discord.js and distube client pairs
    const clients = await createClients(config)

    // Read commands from commands directory
    let commands = new Collection() as Collection<string, Command>
    let commandsPath = path.join(__dirname, 'commands');
    let commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

    for (let file of commandFiles) {
        let filePath = path.join(commandsPath, file);
        let command = (await import(filePath)).default as Command
        commands.set(command.name, command)
    }

    registerDistubeEventListeners(clients, config)
    registerDiscordEventListeners(clients, config, commands)
}