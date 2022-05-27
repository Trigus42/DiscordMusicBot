import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"

class NewCommand extends Command {
    public name: string = "help"
    public description: string = "Prints help message"
    public aliases: string[] = ["h"]
    public args: boolean = false
    public usage: string = "help [command]"
    public guildOnly: boolean = false
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
        let embed = new Discord.MessageEmbed()
            .setColor("#fffff0")
            .setTitle("**COMMANDS**\n")
            .setAuthor({name: message.author.tag.split("#")[0], iconURL: message.author.displayAvatarURL({dynamic:true})})
            .setFooter({text: client.user.username + " | Syntax:  \"<>\": required, \"[]\": optional", iconURL: client.user.displayAvatarURL({dynamic:true})})
            .addField(`\`$/autoplay\` **/** \`$/ap\``, "Enables autoplay", true)
            .addField(`\`$/filter <add/del> <NAME> [OPTIONS]\``, "Add/delete [custom filters](https://ffmpeg.org/ffmpeg-filters.html)", true)
            .addField(`\`$/help\` **/** \`$/h\``, "List of all commands", true)
            .addField(`\`$/jump <POSITION>\``, "Jumps to a song in queue", true)
            .addField(`\`$/loop <0/1/2>\``, "Loop (off / song / queue)", true)
            .addField(`\`$/move <FROM> <TO>\` **/** \`$/mv\``, "Moves a song from one position to another", true)
            .addField(`\`$/pause\``, "Pauses the song", true)
            .addField(`\`$/ping\``, "Gives you the ping", true)
            .addField(`\`$/play <URL/NAME> [POSITION]\` **/** \`$/p\``, "Add song to queue", true)
            .addField(`\`$/prefix <NEW PREFIX>\``, "Change prefix", true)
            .addField(`\`$/queue\` **/** \`$/qu\``, "Shows current queue", true)
            .addField(`\`$/resume\` **/** \`$/r\``, "Resume the song", true)
            .addField(`\`$/seek <HH:MM:SS>\``, "Moves in the song to HH:MM:SS", true)
            .addField(`\`$/shuffle\` **/** \`$/mix\``, "Shuffles the queue", true)
            .addField(`\`$/skip [POSITION]\` **/** \`$/s\``, "Skips current song or song at POSITION", true)
            .addField(`\`$/status\``, "Update playing message", true)
            .addField(`\`$/stop\``, "Stops playing", true)
            .addField(`\`$/uptime\``, "Shows you the bot's uptime", true)
            .addField(`\`$/volume <VOLUME>\` **/** \`$/vol\``, "Changes volume", true)
            // .addField("**FILTERS**", Object.keys(filters).map((filter) => `\`$/${filter}\``).join(" "))

        message.channel.send({ embeds: [embed] })
    }
}

export default new NewCommand()