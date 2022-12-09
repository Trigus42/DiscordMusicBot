import { validate } from "./validate"
import * as api from "./api"

/**
   * Return array of songs from url containing the title and artist.
  */
 export async function tracks(url: string, limit=500) {
    const urlData = await validate(url)
    if (!urlData) return Error("Invalid URL")

    switch (urlData.pageType) {
        case "track": {
            const data = await api.getTrack(urlData.id, {limit: limit})
            
        }
        case "album": {
            const data = await api.getAlbum(urlData.id, {limit: limit})
        }
        case "playlist": {
            const data = await api.getPlaylist(urlData.id, {limit: limit})
            
        }
        case "artist": {
            const data = await api.getArtist(urlData.id, {limit: limit})
        }
        default: return new Error("Type not supported")
    }
}