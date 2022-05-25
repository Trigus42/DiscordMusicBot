
mainClient.on("messageCreate", async message => {
    mainClient.emit("messageCreate", message)
    try {
        // Ignore non commands, messages from bots and DMs
        if (message.author.bot || !message.guild) return

        // Get prefix for guild
        let prefix = await db.guilds.get("prefix", message.guild.id) ?? db.userConfig.prefix

        // React if message starts with prefix 
        if (message.content.startsWith(prefix)) {
            message.react("🆗")
        }
        // React if message mentions bot
        else if (message.mentions.members.has(mainClient.user.id)) {
            message.reply({ embeds: [new Discord.MessageEmbed().setAuthor({name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })}).setDescription(`My Prefix is "${prefix}". To get started; type ${prefix}help`)]})
            return
        }
        // Return if message doesn't start with prefix
        else {
            return
        }

        const args = message.content.slice(prefix.length).trim().split(/ +/g); // Remove prefix and split message into arguments
        const command = args.shift();                                          // Get command name (first argument)

        //////////////////////////
        //// GENERAL COMMANDS ////
        //////////////////////////

        else if (command === "prefix") {
            // If no arguments are given, return current prefix
            if (!args[0]){
                Embeds.embedBuilderMessage(mainClient, message, "RED", `Current Prefix: \`${prefix}\``, "Please provide a new prefix")
                return
            }

            // If user is not owner, return error
            if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                Embeds.embedBuilderMessage(mainClient, message, "RED", "PREFIX", "❌ You don't have permission for this Command")
                return
            }

            // If prefix includes spaces, return error
            if (args[1]) {
                Embeds.embedBuilderMessage(mainClient, message, "RED", "PREFIX", "❌ The prefix can't have whitespaces")
                return
            }

            // Set new prefix in database
            db.guilds.set("prefix", args[0], message.guild.id)
            Embeds.embedBuilderMessage(mainClient, message, "#fffff0", "PREFIX", `☑️ Successfully set new prefix to **\`${args[0]}\`**`)
            return
        }

        //////////////////////
        //// GET INSTANCE ////
        //////////////////////

        // Get pair of client and distube for the members voice channel or use a new pair if member is in a new voice channel
        let clientArray = clients.find(i =>
            i.distube.getQueue(message.guildId) ? // Check if client has a queue
            i.distube.getQueue(message.guildId).voiceChannel.id === message.member.voice.channel.id : false // Check if client queue is in the same voice channel as the message author
        ) ?? clients.find(i => // If no client has been found, use a new client
            !i.distube.getQueue(message.guildId) // Check if client has no queue
            && i.discord.guilds.fetch().then(guilds => guilds.has(message.guildId)) // Check if client is in the same guild as the message author
        )

        if (!clientArray) {
            Embeds.embedBuilderMessage(mainClient, message, "RED", "❌ There are no available clients", "Please try again later or free up one of the clients")
            return
        }

        let client = clientArray.discord
        let distube = clientArray.distube
        let queue = distube.getQueue(message.guild.id)

        if (queue) {
            queue.textChannel = message.channel as Discord.TextChannel
        }

        }
    } catch (error) {
        console.error(error)
    }
    })