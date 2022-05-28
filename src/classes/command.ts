import * as Discord from 'discord.js'
import { DisTube } from 'distube'
import { Config } from '../config'
import { Dict } from '../interfaces'

export class Command {
    public name!: string
    public description: string = "No description"
    public aliases: string[] = []
    public needsArgs: boolean = false
    public usage: string = "No usage"
    public guildOnly: boolean = false
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = false
    public hidden: boolean = false
    public enabled: boolean = false
    public cooldown: number = 0
    public cooldowns: Dict = {}
    public needsUserInVC: boolean = false
    
    public async execute(message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube, config?: Config): Promise<void> {
        throw new Error("Method not implemented.");
    }

    constructor() {}
}