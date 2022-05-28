import * as Discord from "discord.js"

/**
 *  Build and send embed in the channel of the message
 */
export function embedBuilderMessage({ client, message, color, title, description, thumbnail }: { client: Discord.Client; message: Discord.Message; color: Discord.ColorResolvable; title?: string; description?: string; thumbnail?: string }): Promise<Discord.Message> {
    try {
        let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor({name: message.author.tag.split("#")[0], iconURL: message.member?.user.displayAvatarURL({ dynamic: true })})
            .setFooter({text: client.user?.username ?? "", iconURL: client.user?.displayAvatarURL()})

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
export function embedBuilder({ client, channel, user, color, title, description, thumbnail }: { client: Discord.Client; channel: Discord.TextChannel | Discord.GuildTextBasedChannel; user?: Discord.User; color?: Discord.ColorResolvable; title?: string; description?: string; thumbnail?: string }) {
    let embed = new Discord.MessageEmbed()
        .setColor(color ?? "#fffff0")
        .setFooter({text: client.user?.username ?? "", iconURL: client.user?.displayAvatarURL()})

    if (user) embed.setAuthor({name: user.tag.split("#")[0], iconURL: user.displayAvatarURL({ dynamic: true })})
    if (title) embed.setTitle(title)
    if (description) embed.setDescription(description)
    if (thumbnail) embed.setThumbnail(thumbnail)

    return channel.send({ embeds: [embed] })
}
