import { Command } from "../classes/command"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { SelectMenuBuilder } from "discord.js"
import  {Player} from "../player"

export class TLCommand extends Command {
	public aliases: string[] = ["play", "p"]
	public argsUsage = "<url> [position]"
	public description = "Add a song or playlist to the queue"
	public enabled = true
	public guildOnly = true
	public needsArgs = true
	public needsClientInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, player: Player) {
		
	}
}

export default new TLCommand()