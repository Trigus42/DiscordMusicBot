import got from 'got'
import { stringifyRestParams } from '../utils'
import { OptionalGlobalParameters } from '../const/restParameters'
import { Convert as PlaylistConvert, Playlist } from '../responses/playlist'
import { Convert as PlaylistTracksConvert, PlaylistTracks } from '../responses/playlist-tracks'

type OptionalPlaylistParameters = OptionalGlobalParameters & {}

export async function getPlaylist(playlistId: string, parameters?: OptionalPlaylistParameters) {
  const response = await got(`https://api.deezer.com/playlist/${playlistId}` + stringifyRestParams(parameters))
  const data = PlaylistConvert.toPlaylist(response.body)

  if (!data.checksum) {
    if (JSON.parse(response.body).error.type === 'OAuthException') {
      return Error("Playlist is set private")
    } else {
      return Error("Playlist is not available")
    }
  }
  
  return data
}

export async function getPlaylistTracks(playlistId: string, parameters?: OptionalPlaylistParameters) {
  const response = await got(`https://api.deezer.com/playlist/${playlistId}/tracks` + stringifyRestParams(parameters))
  const data = PlaylistTracksConvert.toPlaylistTracks(response.body)

  if (!data.checksum) {
    if (JSON.parse(response.body).error.type === 'OAuthException') {
      return Error("Playlist is set private")
    } else {
      return Error("Playlist is not available")
    }
  }

  return data
}