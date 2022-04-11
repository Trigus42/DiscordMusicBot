import * as Discord from "discord.js"
import * as DisTube from "distube"
import { Queue } from "distube"

import {BUTTONS} from "../const/buttons"
import * as embeds from "../embeds/index"
import { DB } from "../db"

/**
 *  Generate and send status embed
 */
 async function sendStatusEmbed(queue: DisTube.Queue, db: DB, song?: DisTube.Song, title?: string) {
    // If no song is provided, use the first song in the queue
    song = song ?? queue.songs[0]

    let filters = queue.filters.map(filter => {return filter.includes(queue.textChannel.guildId) ? filter.split(queue.textChannel.guildId)[1] : filter})

    let embed = new Discord.MessageEmbed()
        .setColor("#fffff0")
        .setTitle(title ?? "Playing Song")
        .setDescription(`Song: [\`${song.name}\`](${song.url})`)
        .addField("Duration:", `\`${queue.formattedCurrentTime !== "00:00" ? queue.formattedCurrentTime + " / " + song.formattedDuration: song.formattedDuration}\``, true)
        .addField("Queue:", `\`${queue.songs.length + (queue.songs.length < 2 ? " song" : " songs")} - ${queue.formattedDuration}\``, true)
        .addField("Volume:", `\`${queue.volume} %\``, true)
        .addField("Loop:", `  \`${queue.repeatMode ? queue.repeatMode === 2 ? "Queue" : "Song" : "❌"}\``, true)
        .addField("Autoplay:", `\`${queue.autoplay ? "✅" : "❌"}\``, true)
        .addField("Filter:", `\`${filters.length !== 0 ? filters : "❌"}\``, true)
        .setFooter({text: queue.client.user.username, iconURL: queue.client.user.displayAvatarURL()})
    if (song.user) {embed.setAuthor({name: song.user.tag.split("#")[0], iconURL: song.user.displayAvatarURL({ dynamic: true })})}
    if (song.thumbnail) {embed.setThumbnail(song.thumbnail)}

    // Send new playing message
    const embedMessage = await queue.textChannel.send({
        embeds: [embed],
        components: [new Discord.MessageActionRow({components: [
            BUTTONS.playPauseButton,
            BUTTONS.backButton,
            BUTTONS.nextButton,
            BUTTONS.seekBackwardButton,
            BUTTONS.seekForwardButton,
        ]})]
    })

    // Save the message id to db
    db.kvstore.put(`playingembed_${queue.voiceChannel.id}`, embedMessage.id)

    // Return the message
    return embedMessage
}

/**
 *  Send and watch the status embed
 */
export async function statusEmbed(queue: DisTube.Queue, db: DB, song?: DisTube.Song, status?: string) {
    try {
        // Delete old playing message if there is one
        try {
            (await queue.textChannel.messages.fetch(await db.kvstore.get(`playingembed_${queue.voiceChannel.id}`))).delete()
        /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
        } catch (error) {}

        // Send new playing message
        let embedMessage = await sendStatusEmbed(queue, db, song, status)

        // Collect button interactions
        const collector = embedMessage.createMessageComponentCollector()
        collector.on("collect", async (interaction: any) => {
            // Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
            interaction.deferUpdate()

            // Check if user is in the voice channel
            if (!queue.voiceChannel.members.has(interaction.member.user.id)) {return}

            switch (interaction.customId) {
                case BUTTONS.playPauseButton.customId:
                    if (queue.playing) {
                        queue.pause()

                        if (db.userConfig.actionMessages) {
                            embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "PAUSED", "Paused the song")
                                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                            statusEmbed(queue, db, song, "Paused")
                        }
                    } else {
                        queue.resume()

                        if (db.userConfig.actionMessages) {
                            embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "RESUMED", "Resumed the song")
                                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                            statusEmbed(queue, db, song)
                        }
                    }           
                    return

                case BUTTONS.nextButton.customId:
                    if (!queue.autoplay && queue.songs.length <= 1) {
                        queue.stop()
                        queue.emit("finish", queue)
                    } else {
                        await queue.skip()
                    }

                    if (db.userConfig.actionMessages) {
                        embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "SKIPPED", "Skipped the song")
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                    }
                    // The Distube "playSong" event will call the "playsong" function again
                    return

                case BUTTONS.backButton.customId:
                    queue.previous()

                    if (db.userConfig.actionMessages) {
                        embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "PREVIOUS", "Playing previous song")
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                    }
                    // The Distube "playSong" event will call the "playsong" function again
                    return

                case BUTTONS.seekBackwardButton.customId:
                    var seektime = queue.currentTime - 10
                    if (seektime < 0) {seektime = 0}
                    queue.seek(Number(seektime))

                    if (db.userConfig.actionMessages) {
                        embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "Seeked", "Seeked the song for \`-10 seconds\`")
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                    }
                    statusEmbed(queue, db, song)
                    return

                case BUTTONS.seekForwardButton.customId:
                    var seektime = queue.currentTime + 10
                    if (seektime >= queue.songs[0].duration) { seektime = queue.songs[0].duration - 1 }
                    queue.seek(Number(seektime))

                    if (db.userConfig.actionMessages) {
                        embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "Seeked", "Seeked the song for \`+10 seconds\`")
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                    }
                    statusEmbed(queue, db, song)
                    return
            }
        })
    } catch (error) {
        console.error(error)
    }
}