import * as Discord from "discord.js"
import * as DisTube from "distube"

/**
 *  Build and return array of embeds for the queue
 */
export function queueEmbed(queue: DisTube.Queue, client: Discord.Client): Discord.MessageEmbed[]  {
    let embeds = []

    // Create embeds (one per 10 songs)
    for (let i = 0; i < queue.songs.length; i += 10) {
        // Get next 10 songs
        const current = queue.songs.slice(i, i+10)

        // Create string of each song ("**Index** - [Title](Link)")
        let info: string[] = []
        for (let j = 0; j < current.length; j++) {
            try {
                info[j] = `**${j+i}** - [${current[j].name}](${current[j].url})`
            } catch (error) {
                info[j] = `**${j+i}** - ${current[j].url}`
            }
        }

        // Create and add embed
        const embed = new Discord.MessageEmbed()
            .setTitle("Server Queue")
            .setColor("#fffff0")
            .setDescription(`**Current Song - [\`${queue.songs[0].name}\`](${queue.songs[0].url})**\n\n${info.join("\n")}`)
            .setFooter(client.user.username, client.user.displayAvatarURL())
        embeds.push(embed)
    }

    // Return the embeds
    return embeds
}