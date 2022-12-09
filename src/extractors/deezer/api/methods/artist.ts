import got from 'got'
import { Convert as ArtistConvert, Artist } from '../responses/artist'
import { Convert as ArtistAlbumsConvert, ArtistAlbums } from '../responses/artist-albums'
import { stringifyRestParams } from '../utils'
import { OptionalGlobalParameters } from '../const/restParameters'

type OptionalArtistParameters = OptionalGlobalParameters & {}

export async function getArtist(artistId: string, parameters?: OptionalArtistParameters) {
  const result = await got(`https://api.deezer.com/artist/${artistId}` + stringifyRestParams(parameters))
  const data = ArtistConvert.toArtist(result.body)

  if(!data.name) return Error("Artist is not available")

  return data
}

export async function getArtistAlbums(artistId: string, parameters?: OptionalArtistParameters) {
  const result = await got(`https://api.deezer.com/artist/${artistId}/albums` + stringifyRestParams(parameters))
  const data = ArtistAlbumsConvert.toArtistAlbums(result.body)

  if(!data.data) return Error("Artist albums are not available")

  return data
}