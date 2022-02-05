import * as Discord from "discord.js"

export async function help(message: Discord.Message, prefix: string, filters: Object) {
    let helpembed = new Discord.MessageEmbed()
        .setColor("#fffff0")
        .setTitle("***COMMANDS***\n")
        .setAuthor(message.author.tag, message.member.user.displayAvatarURL({dynamic:true}))
        .setFooter(message.client.user.username + " | Syntax:  <>...must    []...optional", message.client.user.displayAvatarURL())
        .addField(`\`${prefix}prefix <NEW PREFIX>\``, `**Change prefix**`, true)
        .addField(`\`${prefix}help\`  \`${prefix}h\``, `**List of all commands**`, true)
        .addField(`\`${prefix}play <URL/NAME>\` \`${prefix}p\``, `**Plays a song**`, true)
        .addField(`\`${prefix}status\``, `**Update playing message**`, true)
        .addField(`\`${prefix}pause\``, `**Pauses the song**`, true)
        .addField(`\`${prefix}resume\`  \`${prefix}r\``, `**Resume the song**`, true)
        .addField(`\`${prefix}shuffle\`  \`${prefix}mix\``, `**Shuffles the queue**`, true)
        .addField(`\`${prefix}autoplay\`  \`${prefix}ap\``, `**Enables autoplay**`, true)
        .addField(`\`${prefix}skip\`  \`${prefix}s\``, `**Skips current song**`, true)
        .addField(`\`${prefix}stop\`  \`${prefix}leave\``, `**Stops playing**`, true)
        .addField(`\`${prefix}seek <HH:MM:SS>\``, `**Moves in the song to HH:MM:SS**`, true)
        .addField(`\`${prefix}move <FROM> <TO>\` \`${prefix}mv\``, `**Moves a song from one position to another**`, true)
        .addField(`\`${prefix}volume <VOLUME>\`  \`${prefix}vol\``, `**Changes volume**`, true)
        .addField(`\`${prefix}queue\`  \`${prefix}qu\``, `**Shows current queue**`, true)
        .addField(`\`${prefix}loop <0/1/2>\``, `**Loop (off / song / queue)**`, true)
        .addField(`\`${prefix}jump <POSITION>\``, `**Jumps to a song in queue**`, true)
        .addField(`\`${prefix}ping\``, `**Gives you the ping**`, true)
        .addField(`\`${prefix}uptime\``, `**Shows you the bot's uptime**`, true)
        .addField("***FILTERS:***", Object.keys(filters).map(filter => `\`${prefix}${filter}\``).join(" "))

    return message.channel.send({ embeds: [helpembed] })
}