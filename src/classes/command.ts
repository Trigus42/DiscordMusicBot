import * as Discord from "discord.js"
import { DisTube } from "distube"
import { Config } from "../config"
import { Dict } from "../interfaces"

export class Command {
	public name!: string
	public description = "No description"
	public aliases: string[] = []
	public needsArgs = false
	public usage = "No usage"
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = false
	public cooldown = 0
	public cooldowns: Dict = {}
	public needsUserInVC = false
    
	public async execute(message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube, config?: Config): Promise<void> {
		throw new Error("Method not implemented.")
	}

	constructor() {}
}