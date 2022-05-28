import * as Discord from "discord.js"

/**
 *  Build and send embed in the channel of the message
 */
export async function embedBuilderMessage({ client, message, color, title, description, thumbnail, deleteAfter }: { client: Discord.Client; message: Discord.Message; color: Discord.ColorResolvable; title?: string; description?: string; thumbnail?: string, deleteAfter?: number }) {
    let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor({name: message.author.tag.split("#")[0], iconURL: message.member?.user.displayAvatarURL({ dynamic: true })})
        .setFooter({text: client.user?.username ?? "", iconURL: client.user?.displayAvatarURL()})

    if (title) {embed.setTitle(title)}
    if (description) {embed.setDescription(description)}
    if (thumbnail) {embed.setThumbnail(thumbnail)}

    let embedMsg = await message.channel.send({ embeds: [embed] })
        .then(msg => {
            if (deleteAfter) {
                setTimeout(() => msg.delete().catch(console.error), deleteAfter)
            }
            return msg
        })
        .catch(console.error)

    return embedMsg
}

/**
 *  Build and send embed in the channel of the queue
 */
export async function embedBuilder({ client, channel, author, color, title, description, thumbnail, deleteAfter }: { client: Discord.Client; channel: Discord.TextChannel | Discord.GuildTextBasedChannel; author?: Discord.User; color?: Discord.ColorResolvable; title?: string; description?: string; thumbnail?: string, deleteAfter?: number }) {
    let embed = new Discord.MessageEmbed()
        .setColor(color ?? "#fffff0")
        .setFooter({text: client.user?.username ?? "", iconURL: client.user?.displayAvatarURL()})

    if (author) embed.setAuthor({name: author.tag.split("#")[0], iconURL: author.displayAvatarURL({ dynamic: true })})
    if (title) embed.setTitle(title)
    if (description) embed.setDescription(description)
    if (thumbnail) embed.setThumbnail(thumbnail)

    let embedMsg = await channel.send({ embeds: [embed] })
        .then(msg => {
            if (deleteAfter) {
                setTimeout(() => msg.delete().catch(console.error), deleteAfter)
            }
            return msg
        })
        .catch(console.error)

    return embedMsg
}
