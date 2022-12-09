import { ActivityType, Client, IntentsBitField, Partials } from "discord.js"
import { UserConfig } from "./interfaces/structs"

/**
   * Returns an array of available discord clients
   *
   * @param tokens - List of Discord bot tokens
   * @returns Client array
   *
*/
export async function createClients(tokens: string[]) {
	const clients: Client[] = []
	for (const token of tokens) {

		// Discord client
		const discord = new Client({
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.GuildVoiceStates,
				IntentsBitField.Flags.DirectMessages
			],
			partials: [Partials.Channel]
		})
		discord.login(token)

		// Log when the bot is ready
		discord.on("ready", async () => {
			console.log(`Client "${discord.user?.tag}" is ready. Invite link: https://discord.com/oauth2/authorize?client_id=${discord.user.id}&permissions=105330560064&scope=bot`)
			discord.user?.setPresence({
				status: "online",
				activities: [
					{
						name: "Music",
						type: ActivityType.Playing,
					}
				]
			})
		})

		// Log when reconnecting
		discord.on("reconnecting", () => {
			console.log(`Client "${discord.user?.tag}" is reconnecting`)
			discord.user?.setPresence({ status: "invisible" })
		})

		// Log when disconnected
		discord.on("disconnect", () => {
			console.log(`Client "${discord.user?.tag}" is disconnected`) 
			discord.user?.setPresence({ status: "invisible" })
		})
        
		clients.push(discord)
	}

	return clients
}