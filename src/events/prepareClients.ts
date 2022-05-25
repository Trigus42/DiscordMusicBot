import { registerDistubeEventListeners } from "./distubeEventListerners"
import { DisTube } from "distube"
import { Client } from "discord.js"
import { Config } from "../config"

export function prepareClients(clients: {discord: Client, distube: DisTube}[], config: Config): void {
    for (let {discord: client, distube} of clients) {
        // Log when ready and set presence
        client.on("ready", () => {
            // Wait for client user to be set
            while (!client.user) setTimeout(() => {}, 100)

            console.log(`Client "${client.user.tag}" is ready. Invite link: https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=103183076416&scope=bot`)
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

        // Log when reconnecting
        client.on("reconnecting", () => {
            console.log(`Client "${client.user.tag}" is reconnecting`)
            client.user.setPresence({ status: "invisible" })
        })

        // Log when disconnected
        client.on("disconnect", () => {
            console.log(`Client "${client.user.tag}" is disconnected`); 
            client.user.setPresence({ status: "invisible" })
        })

        registerDistubeEventListeners(distube, config)
    }
}