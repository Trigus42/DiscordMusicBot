import * as Discord from "discord.js"
import DisTube from "distube"

/**
 *  Build and send embed in the channel of the message
 */
export function embedBuilderMessage(client: Discord.Client, message: Discord.Message, color: Discord.ColorResolvable, title?: string, description?: string, thumbnail?: string) {
    try {
        let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor({name: message.author.tag.split("#")[0], iconURL: message.member.user.displayAvatarURL({ dynamic: true })})
            .setFooter({text: client.user.username, iconURL: client.user.displayAvatarURL()})

        if (title) {embed.setTitle(title)}
        if (description) {embed.setDescription(description)}
        if (thumbnail) {embed.setThumbnail(thumbnail)}

        return message.channel.send({ embeds: [embed] })
    } catch (error) {
        console.error(error)
    }
}

/**
 *  Build and send embed in the channel of the queue
 */
export function embedBuilder(client: Discord.Client, user: Discord.User, channel: Discord.TextChannel|Discord.GuildTextBasedChannel, color: Discord.ColorResolvable, title?: string, description?: string, thumbnail?: string) {
    let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor({name: user.tag.split("#")[0], iconURL: user.displayAvatarURL({ dynamic: true })})
        .setFooter({text: client.user.username, iconURL: client.user.displayAvatarURL()})

    if (title) embed.setTitle(title)
    if (description) embed.setDescription(description)
    if (thumbnail) embed.setThumbnail(thumbnail)

    return channel.send({ embeds: [embed] })
}
