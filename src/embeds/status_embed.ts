import * as Discord from "discord.js"
import * as DisTube from "distube"
import { Queue } from "distube"

import {Buttons} from "../const/buttons"
import * as embeds from "../embeds/index"
import { DB } from "../db"

/**
 *  Send and watch the status embed
 */
export async function status_embed(queue: DisTube.Queue, db: DB, song?: DisTube.Song, status?: string) {
    try {
        // Delete old playing message if there is one
        try {
            (await queue.textChannel.messages.fetch(await db.kvstore.get(`playingembed_${queue.textChannel.guildId}`, 1) as string)).delete()
        } catch (error) {}

        // Send new playing message
        let embedMessage = await send_status_embed(queue, db, song, status)

        // Collect button interactions
        const collector = embedMessage.createMessageComponentCollector()
        collector.on('collect', async (interaction: any) => {
            // Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
            interaction.deferUpdate()

            // Check if user is in the voice channel
            if (!queue.voiceChannel.members.has(interaction.member.user.id)) return

            switch (interaction.customId) {
                case Buttons.play_pause_Button.customId:
                    if (queue.playing) {
                        queue.pause()

                        if (db.user_config.action_messages) 
                            embeds.embed_builder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "PAUSED", `Paused the song`)
                                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                            status_embed(queue, db, song, "Paused")
                    } else {
                        queue.resume()

                        if (db.user_config.action_messages) 
                            embeds.embed_builder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "RESUMED", `Resumed the song`)
                                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                            status_embed(queue, db, song)
                    }           
                    return

                case Buttons.next_Button.customId:
                    if (!queue.autoplay && queue.songs.length <= 1) {
                        queue.stop()
                        queue.emit("finish", queue)
                    } else {
                        await queue.skip()
                    }

                    if (db.user_config.action_messages) 
                        embeds.embed_builder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "SKIPPED", `Skipped the song`)
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))

                    // The Distube "playSong" event will call the "playsong" function again
                    return

                case Buttons.back_Button.customId:
                    queue.previous()

                    if (db.user_config.action_messages) 
                        embeds.embed_builder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "PREVIOUS", `Playing previous song`)
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))

                    // The Distube "playSong" event will call the "playsong" function again
                    return

                case Buttons.seek_backward_Button.customId:
                    var seektime = queue.currentTime - 10
                    if (seektime < 0) seektime = 0
                    queue.seek(Number(seektime))

                    if (db.user_config.action_messages) 
                        embeds.embed_builder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "Seeked", `Seeked the song for \`-10 seconds\``)
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))

                    status_embed(queue, db, song)
                    return

                case Buttons.seek_forward_Button.customId:
                    var seektime = queue.currentTime + 10
                    if (seektime >= queue.songs[0].duration) { seektime = queue.songs[0].duration - 1 }
                    queue.seek(Number(seektime))

                    if (db.user_config.action_messages) 
                        embeds.embed_builder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "Seeked", `Seeked the song for \`+10 seconds\``)
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))

                    status_embed(queue, db, song)
                    return
            }
        })
    } catch (error) {
        console.error(error)
    }
}

/**
 *  Generate and send status embed
 */
async function send_status_embed(queue: DisTube.Queue, db: DB, song?: DisTube.Song, title?: string) {
    // If no song is provided, use the first song in the queue
    song = song ?? queue.songs[0]

    let embed = new Discord.MessageEmbed()
        .setColor("#fffff0")
        .setTitle(title ?? "Playing Song")
        .setDescription(`Song: [\`${song.name}\`](${song.url})`)
        .addField("Duration:", `\`${queue.formattedCurrentTime !== "00:00" ? queue.formattedCurrentTime + " / " + song.formattedDuration: song.formattedDuration}\``, true)
        .addField("Queue:", `\`${queue.songs.length + (queue.songs.length < 2 ? " song" : " songs")} - ${queue.formattedDuration}\``, true)
        .addField("Volume:", `\`${queue.volume} %\``, true)
        .addField("Loop:", `  \`${queue.repeatMode ? queue.repeatMode === 2 ? ":ballot_box_with_check: Queue" : ":ballot_box_with_check: Song" : "❌"}\``, true)
        .addField("Autoplay:", `\`${queue.autoplay ? ":ballot_box_with_check:" : "❌"}\``, true)
        .addField("Filter:", `\`${queue.filters.length != 0 ? queue.filters : "❌"}\``, true)
        .setFooter(queue.client.user.username, queue.client.user.displayAvatarURL())
    if (song.user) embed.setAuthor(song.user.tag, song.user.displayAvatarURL({ dynamic: true }))
    if (song.thumbnail) embed.setThumbnail(song.thumbnail)

    // Send new playing message
    const embedMessage = await queue.textChannel.send({
        embeds: [embed],
        components: [new Discord.MessageActionRow({components: [
            Buttons.play_pause_Button,
            Buttons.back_Button,
            Buttons.next_Button,
            Buttons.seek_backward_Button,
            Buttons.seek_forward_Button,
        ]})]
    })

    // Save the message id to db
    db.kvstore.put(`playingembed_${embedMessage.guild.id}`, embedMessage.id)

    // Return the message
    return embedMessage
}