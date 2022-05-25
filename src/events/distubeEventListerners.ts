distube
    .on("playSong", (queue, song) => {
        try {
            Embeds.statusEmbed(queue, db, song)
            return
        } catch (error) {
            console.error(error)
        }
    })
    .on("addSong", (queue, song) => {
        try {
            Embeds.songEmbed(queue, song)
            return
        } 
        catch (error) { 
            console.error(error)
        }
    })
    .on("addList", (queue, playlist) => {
        try {
            Embeds.embedBuilder(client, playlist.user, queue.textChannel, "#fffff0", "Added a Playlist", `Playlist: [\`${playlist.name}\`](${playlist.url})  -  \`${playlist.songs.length} songs\` \n\nRequested by: ${playlist.user}`, playlist.thumbnail)
            return
        } catch (error) {
            console.error(error)
        }
    })
    .on("searchResult", (message, results) => {
        try {
            let i = 0
            Embeds.embedBuilderMessage(client, message, "#fffff0", "", `**Choose an option from below**\n${results.map(song => `**${++i}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`)
            return
        } catch (error) {
            console.error(error)
        }
    })
    .on("searchCancel", (message) => {
        try {
            message.reactions.removeAll()
            message.react("❌")
        } catch (error) {
            console.error(error)
        }
        try {
            Embeds.embedBuilderMessage(client, message, "RED", "Searching canceled", "")
            return
        } catch (error) {
            console.error(error)
        }
    })
    .on("error", (channel, error) => {
        try {
            channel.lastMessage.reactions.removeAll()
            channel.lastMessage.react("❌")
        } catch (error) {
            console.error(error)
        }

        console.log(error)

        try {
            Embeds.embedBuilder(client, channel.lastMessage.member.user, channel, "RED", "An error encountered:", "```"+error+"```")
            return
        } catch (error) {
            console.error(error)
        }
    })
    .on("finish", async queue => {
        try {
            Embeds.embedBuilder(client, queue.textChannel.lastMessage.member.user, queue.textChannel, "RED", "There are no more songs left").then(msg => setTimeout(() => msg.delete().catch(console.error), 60000))
        } catch (error) {
            console.error(error)
        }
    })
    .on("empty", queue => {
        try {
            Embeds.embedBuilder(client, queue.textChannel.lastMessage.member.user, queue.textChannel, "RED", "Left the channel cause it got empty").then(msg => setTimeout(() => msg.delete().catch(console.error), 60000))
            return
        } catch (error) {
            console.error(error)
        }
    })
    .on("noRelated", queue => {
        try {
            Embeds.embedBuilder(client, queue.textChannel.lastMessage.member.user, queue.textChannel, "RED", "Can't find related video to play. Stop playing music.").then(msg => setTimeout(() => msg.delete().catch(console.error), 60000))
            return
        } catch (error) {
            console.error(error)
        }
    })
    .on("initQueue", queue => {
        try {
            queue.autoplay = false
            queue.volume = 100
        } catch (error) {
            console.log(error)
        }
    })
    .on("searchDone", () => {})
    .on("searchNoResult", () => {})
    .on("searchInvalidAnswer", () => {})