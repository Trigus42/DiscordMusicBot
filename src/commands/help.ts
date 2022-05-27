import * as Discord from "discord.js"

export class HelpCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'help',
            description: 'Prints help message',
            chatInputCommand: {register: true}
        })
    }

    public async sendEmbed(user: Discord.User) {
        let embed = new Discord.MessageEmbed()
            .setColor("#fffff0")
            .setTitle("**COMMANDS**\n")
            .setAuthor({name: user.tag.split("#")[0], iconURL: user.displayAvatarURL({dynamic:true})})
            .setFooter({text: user.username + " | Syntax:  \"<>\": required, \"[]\": optional", iconURL: user.displayAvatarURL({dynamic:true})})
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
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        this.sendEmbed(interaction.user)
    }
}