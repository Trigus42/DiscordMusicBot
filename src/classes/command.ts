import * as Discord from 'discord.js'
import { DisTube } from 'distube'
import { Config } from '../config'
import { Dict } from '../interfaces'

export class Command {
    public name: string;
    public description: string;
    public aliases: string[];
    public needsArgs: boolean;
    public usage: string;
    public guildOnly: boolean
    public adminOnly: boolean
    public ownerOnly: boolean
    public needsQueue: boolean
    public hidden: boolean
    public enabled: boolean
    public cooldown: number
    public cooldowns: Dict = {}
    
    public async execute(message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube, config: Config): Promise<void> {
        throw new Error("Method not implemented.");
    }

    constructor() {}
}