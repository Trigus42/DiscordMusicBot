import { Collection } from "discord.js"
import { Command } from "./classes/command"
import { Config } from "./config"
import { createClients } from "./createClients"
import { registerDistubeEventListeners } from "./events/distubeEventListeners"
import { registerDiscordEventListeners } from "./events/discordEventListeners"
import * as fs from "fs"
import * as path from "path"

function exit(event: any, config: Config) {
	console.warn(event)
	console.log("Shutting down!")
	config.clientPairs.forEach(clientPair => {clientPair.discord.destroy()})
	config.db.close()
	process.exit(1)
}

async function main(): Promise<void> {
	// Create config object
	const config = new Config(process.env.CONFIG_DIR, process.env.DB_PATH, process.env.USER_CONFIG_PATH, process.env.FILTERS_PATH)

	// Graceful shutdown
	Object.keys({
		'SIGHUP': 1,
		'SIGINT': 2,
		'SIGTERM': 15
	}).forEach((signal) => {
		process.on(signal, event => exit(event, config))
	})
	process.on('uncaughtException', error => exit(error, config))

	// Create discord.js and distube client pairs
	config.clientPairs = await createClients(config.userConfig.tokens, config.userConfig)

	// Load commands from commands directory
	config.commands = new Collection() as Collection<string, Command>
	const commandsPath = path.join(__dirname, "commands")
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"))

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = (await import(filePath)).default as Command
		if (!command.enabled) return
		config.commands.set(command.aliases[0], command)
	}

	// Drop privileges in docker or warn if root
	if (process.getuid() == 0 || process.getgid() == 0) {
		if (process.env.HOST == "docker") {
			try {
				process.setgid('node');
				process.setuid('node');
			} catch (error) {
				console.error(error)
				console.log('Could not drop privilges. Exiting..');
				process.exit(1);
			}
		} else {
			console.warn("WARNING: Running as root!")
		}
	}

	// Start listeners
	registerDistubeEventListeners(config)
	registerDiscordEventListeners(config)
}

main()