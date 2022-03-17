import * as Discord from "discord.js"
import * as DisTube from "distube"
import { SpotifyPlugin } from "@distube/spotify"
import { YtDlpPlugin } from "@distube/yt-dlp"

import { DB } from "./db"
import { BUTTONS } from "./const/buttons"
import * as Commands from "./commands/index"
import * as Embeds from "./embeds/index"
import { default as Deezer } from "./apis/deezer"

/////////////////
/// Initialize //
/////////////////

let db = new DB("./config/db.sqlite")
let deezer = new Deezer()

// Create a new discord client
const client = new Discord.Client({
    messageCacheLifetime: 0,
    messageSweepInterval: 0,
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
})

// Create a new distube instance
const distube = new DisTube.DisTube(client, {
    youtubeDL: false,
    youtubeCookie: db.userConfig.youtubeCookie ?? undefined,
    youtubeIdentityToken: db.userConfig.youtubeIdentityToken ?? undefined,
    nsfw: db.userConfig.nsfw ?? false,
    customFilters: db.filters,
    searchSongs: 10, 
    leaveOnStop: true,
    leaveOnFinish: false,
    leaveOnEmpty: true,
    plugins: 
        [db.userConfig.spotify ? (new SpotifyPlugin({api: {
            clientId: db.userConfig.spotify.clientId,
            clientSecret: db.userConfig.spotify.clientSecret},
            parallel: true,
            emitEventsAfterFetching: true
        }), new YtDlpPlugin()) : new YtDlpPlugin(), 
    ]
})

// Login to discord
client.login(db.userConfig.token)

/////////////////
///// Events ////
/////////////////

// Log when ready and set presence
client.on("ready", () => {
    console.log(`:: Bot has started as :: ${client.user.tag}`)
    client.user.setPresence({
        status: "online",
        activities: [
            {
                name: "Music",
                type: "PLAYING",
            }
        ]
    })
})

// Log when reconnect
client.on("reconnecting", () => {
    console.log(" :: Reconnecting")
    client.user.setPresence({ status: "invisible" }); // Change discord presence to offline
})

// Log when disconnecting
client.on("disconnect", () => {
    console.log(" :: Disconnect"); 
    client.user.setPresence({ status: "invisible" }); // Change discord presence to offline
})

client.on("messageCreate", async message => {
    try {
        // Ignore non commands, messages from bots and DMs
        if (message.author.bot || !message.guild) return

        // Get prefix for guild
        let prefix = await db.guilds.get("prefix", message.guild.id) ?? db.userConfig.prefix

        // Ignore messages that don't start with the prefix
        if (!message.content.startsWith(prefix)) return; 

        const args = message.content.slice(prefix.length).trim().split(/ +/g); // Remove prefix and split message into arguments
        const command = args.shift();                                          // Get command name (first argument)

        // React if message starts with prefix 
        if (message.content.startsWith(prefix)) {
            message.react("🆗")
        }
        // React if message mentions bot
        else if (message.mentions.has(client.user)) {
            message.reply({ embeds: [new Discord.MessageEmbed().setColor("#fffff0").setAuthor(`${message.author.username}, My Prefix is ${prefix}, to get started; type ${prefix}help`, message.author.displayAvatarURL({ dynamic: true }))]})
            return
        }
        // Return if message doesn't start with prefix
        else {
            return
        }

        ///////////////////
        //// COMMANDS /////
        ///////////////////
        if (command === "invite" || command === "add") {
            Embeds.embedBuilderMessage(client, message, "#fffff0", "Invite me", `[\`Click here\`](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=49572160&scope=bot)`)
            return
        }
        else if (command === "help"  || command === "about" || command === "h" || command === "info") {
            await Commands.help(message, prefix, await db.guilds.getFilters(message.guild.id)) 
        }
        else if (command === "prefix") {
            // If no arguments are given, return current prefix
            if (!args[0]){
                Embeds.embedBuilderMessage(client, message, "RED", `Current Prefix: \`${prefix}\``, "Please provide a new prefix")
                return
            }

            // If user is not owner, return error
            if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                Embeds.embedBuilderMessage(client, message, "RED", "PREFIX", "❌ You don't have permission for this Command")
                return
            }

            // If prefix includes spaces, return error
            if (args[1]) {
                Embeds.embedBuilderMessage(client, message, "RED", "PREFIX", "❌ The prefix can't have whitespaces")
                return
            }

            // Set new prefix in database
            db.guilds.set("prefix", args[0], message.guild.id)
            Embeds.embedBuilderMessage(client, message, "#fffff0", "PREFIX", `☑️ Successfully set new prefix to **\`${args[0]}\`**`)
            return
        }
        else if (command == "status") {
            let queue = distube.getQueue(message.guild.id)
            if (!queue) {
                Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                return
            }
            await Embeds.statusEmbed(queue, db, queue.songs[0])
            message.react("✅")
            return
        }
        else if (command == "pause") {
            distube.pause(message)
            message.react("✅")
            return
        }
        else if (command == "resume" || command == "r") {
            distube.resume(message)
            message.react("✅")
            return
        }
        else if (command == "shuffle" || command == "mix") {
            await distube.shuffle(message)
            message.react("✅")
            return
        }
        else if (command == "autoplay" || command == "ap") {
            await Embeds.embedBuilderMessage(client, message, "#fffff0", `Autoplay is now ${distube.toggleAutoplay(message) ? "ON" : "OFF"}`)
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
            message.react("✅")
            return
        }
        else if (command === "ping") {
            Embeds.embedBuilderMessage(client, message, "#fffff0", "PING:", `\`${client.ws.ping} ms\``)
            return
        }
        else if (command === "uptime") {
            let days = Math.floor(client.uptime / 86400000)
            let hours = Math.floor(client.uptime / 3600000) % 24
            let minutes = Math.floor(client.uptime / 60000) % 60
            let seconds = Math.floor(client.uptime / 1000) % 60
            Embeds.embedBuilderMessage(client, message, "#fffff0", "UPTIME:", `\`${days}d\` \`${hours}h\` \`${minutes}m\` \`${seconds}s\n\``)
            return
        }
        else if (command === "play" || command === "p") {
            // Check if user in voice channel or bot in voice channel
            if (!message.member.voice.channel) {
                Embeds.embedBuilderMessage(client, message, "RED", "You are not in a voice channel")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                return
            }

            let customPlaylist: DisTube.Playlist
            if (args[0].includes("deezer.com")) {
                let type = args[0].split("/").slice(-2,-1)[0]
                if (["track", "album", "playlist", "artist"].includes(type)) {
                    let tracks = await deezer.tracks(args[0])
                    let search_strings = await Promise.all(tracks.map(async track => track[0] + " - " + track[1]))
                    let urls = await Promise.all(search_strings.map(async search_string => (await distube.search(search_string, {limit: 1}))[0].url))
                    customPlaylist = await distube.createCustomPlaylist(urls, {member: message.member, properties: {message: message}})
                } else {
                    Embeds.embedBuilderMessage(client, message, "RED", "Can only play tracks, albums, playlists and artists from Deezer")
                        .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                    return
                }
            }

            await distube.play(message.member.voice.channel, customPlaylist ?? args.join(" "), {
                position: Number.isInteger(Number(args[1])) ? Number(args[1]) : -1, 
                textChannel: message.channel as Discord.GuildTextBasedChannel, 
                message: message, 
                member: message.member
            })
            message.react("✅")
            return
        }
        else if (command === "move" || command === "mv") {
            if (!isNaN(Number(args[0])) && !isNaN(Number(args[1]))) {
                let queue = distube.getQueue(message)

                // Move song from position args[0] to position args[1]
                queue.songs.splice(Number(args[1]), 0, queue.songs.splice(Number(args[0]), 1)[0])

                message.react("✅")
                queue = distube.getQueue(message)
                return
            }
        }
        else if (command === "skip" || command === "s") {
            let queue = distube.getQueue(message.guild.id)
            // If queue is empty after skipping, stop playing
            if (!queue.autoplay && queue.songs.length <= 1) {
                queue.stop()
                queue.emit("finish", queue)
            } else {
                // Skip song at queue position args[0]
                if (!isNaN(Number(args[0]))) {
                    let skip = Number(args[0])
                    if (Math.abs(skip) <= queue.songs.length) {
                        queue.songs.splice(skip, 1)
                    // If skip is greater than queue length, send error message
                    } else {
                        Embeds.embedBuilderMessage(client, message, "RED", "Can't skip song at position " + skip + " because it doesn't exist")
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                        return
                    }
                // Skip song at current position if no number is given
                } else {
                    await distube.skip(message)
                }
            }
            message.react("✅")
            return
        }
        else if (command === "stop") {
            let queue = distube.getQueue(message.guild.id)
            if (queue) await queue.stop()
            message.react("✅")
            return
        }
        else if (command === "seek") {
            // Get time in seconds from HH:MM:SS time_string
            let time_array = args[0].split(":")
            let time_seconds = 0
            for (let i = 0; i < time_array.length; i++) {
                time_seconds += parseInt(time_array[i]) * Math.pow(60, (time_array.length - 1) - i)
            }
            distube.seek(message, time_seconds)
            message.react("✅")
            return
        }
        else if (command === "volume" || command === "vol") {
            distube.setVolume(message, Number(args[0]))
            message.react("✅")
            return
        }
        else if (command === "queue" || command === "qu") {          
            let queue = distube.getQueue(message)

            if (!queue) {
                Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                return
            }

            const {author, channel} = message
            const queue_embeds = Embeds.queueEmbed(queue, client)
            const guilds = [...client.guilds.cache.values()]

            const embedMessage = await queue.textChannel.send({
                embeds: [queue_embeds[0]],
                components: queue_embeds.length < 2 ? [] : [new Discord.MessageActionRow({components: [
                    BUTTONS.nextButton
                ]})]
            })

            // Exit if there is only one page of guilds (no need for all of this)
            if (queue_embeds.length < 1) return

            // Collect button interactions
            const collector = embedMessage.createMessageComponentCollector()

            let currentIndex = 0
            collector.on("collect", async (interaction: any) => {
                try {
                    // Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
                    interaction.deferUpdate()
                    // Increase/decrease index
                    interaction.customId === BUTTONS.backButton.customId ? (currentIndex -= 1) : (currentIndex += 1)
                    // Respond to interaction by updating message with new embed
                    embedMessage.edit({
                        embeds: [queue_embeds[currentIndex]],
                        components: [
                            new Discord.MessageActionRow({
                                components: [
                                    // back button if it isn't the start
                                    ...(currentIndex ? [BUTTONS.backButton] : []),
                                    // forward button if it isn't the end
                                    ...(currentIndex + 1 < queue_embeds.length ? [BUTTONS.nextButton] : [])
                                ]
                            })
                        ]
                    })
                } catch (error) {
                    console.error(error)
                }
            })
        }
        else if (command === "loop" || command === "repeat") {
            if (0 <= Number(args[0]) && Number(args[0]) <= 2) {
                distube.setRepeatMode(message, parseInt(args[0]))
                await Embeds.embedBuilderMessage(client, message, "#fffff0", "Repeat mode set to:", `${args[0].replace("0", "OFF").replace("1", "Repeat song").replace("2", "Repeat Queue")}`)
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                message.react("✅")
                return
            }
            else {
                Embeds.embedBuilderMessage(client, message, "RED", "ERROR", "Please use a number between **0** and **2**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                return
            }
        }
        else if (command === "jump") {
            let queue = distube.getQueue(message)
            if (!queue) {
                Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                return
            }
        
            if (0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length) {
                await distube.jump(message, parseInt(args[0]))
                    .catch(err => message.channel.send("Invalid song number.")
                        .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000)))
                    message.react("✅")
                return
            }
            else {
                Embeds.embedBuilderMessage(client, message, "RED", "ERROR", `Please use a number between **0** and **${distube.getQueue(message).songs.length}**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*`)
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                return
            }

        }
        else if (command === "filter") {
            if (args[0] === "add") { 
                await db.guilds.setFilters(message.guild.id, {[args[1]] : args[2]})
            } else if (args[0] === "del") {
                await db.guilds.delFilter(message.guild.id, args[1])
            }
            message.react("✅")
            return
        }
        // Position of the last two is important
        else if (Object.keys(await db.guilds.getFilters(message.guild.id)).includes(command)) {
            let queue = distube.getQueue(message.guild.id)
            if (queue) {
                if (queue.filters.includes(message.guildId + command)) {
                    queue.setFilter(message.guild.id + command)
                } else {
                    distube.filters[message.guild.id + command] = (await db.guilds.getFilters(message.guild.id))[command]
                    queue.setFilter(message.guild.id + command)
                }
            }
            message.react("✅")
            return
        }
        else if (message.content.startsWith(prefix)) {
            Embeds.embedBuilderMessage(client, message, "RED", "Unknown Command", `Type ${prefix}help to see all available commands`)
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
            return
        }
    } catch (error) {
        console.error(error)
    }
    })

///////////////
/// DISTUBE ///
///////////////

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
            Embeds.embedBuilder(client, song.user, queue.textChannel, "#fffff0", "Added a Song", `Song: [\`${song.name}\`](${song.url})  -  \`${song.formattedDuration}\` \n\nRequested by: ${song.user}`, song.thumbnail)
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
            return
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