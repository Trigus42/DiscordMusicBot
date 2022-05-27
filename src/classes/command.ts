import * as Discord from 'discord.js';
import { DisTube } from 'distube';
import { Config } from '../config';

export class Command {
    public name: string;
    public description: string;
    public aliases: string[];
    public args: boolean;
    public usage: string;
    public guildOnly: boolean
    public adminOnly: boolean
    public ownerOnly: boolean
    public hidden: boolean
    public enabled: boolean
    public cooldown: number
    // public permission: string
    
    public async execute(message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube, config: Config): Promise<void> {
        throw new Error("Method not implemented.");
    }

    constructor() {}
}