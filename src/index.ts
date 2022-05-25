import * as Discord from "discord.js"
import * as DisTube from "distube"
import { SpotifyPlugin } from "@distube/spotify"
import { YtDlpPlugin } from "@distube/yt-dlp"

import { DB } from "./config"
import { BUTTONS } from "./const/buttons"
import * as Embeds from "./embeds/index"
import { default as Deezer } from "./apis/deezer"

/////////////////
/// Initialize //
/////////////////

const db = new DB("./config/db.sqlite")
const deezer = new Deezer()
