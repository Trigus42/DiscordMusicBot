import { Collection } from "discord.js"
import { Command } from "./classes/command"
import { Config } from "./config"
import { createClients } from "./createClients"
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
	config.clientPairs = await createClients(config)

	// Read commands from commands directory
	config.commands = new Collection() as Collection<string, Command>
	const commandsPath = path.join(__dirname, "commands")
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"))

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = (await import(filePath)).default as Command
		if (!command.enabled) return
		config.commands.set(command.aliases[0], command)
	}

	registerDistubeEventListeners(config)
	registerDiscordEventListeners(config)
}