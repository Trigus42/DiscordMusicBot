import got from 'got'
import { Convert as CovertAlbum, Album } from '../responses/album'
import { Convert as ConvertAlbumTracks, AlbumTracks } from '../responses/album-tracks'
import { stringifyRestParams } from '../utils'
import { OptionalGlobalParameters } from '../const/restParameters'

type OptionalAlbumParameters = OptionalGlobalParameters & {}

export async function getAlbum(albumId: string, parameters?: OptionalAlbumParameters) {
  const result = await got(`https://api.deezer.com/album/${albumId}` + stringifyRestParams(parameters))
  const data = CovertAlbum.toAlbum(result.body)

  if (!data.available) throw new Error("Album is not available")

  return data
}

export async function getAlbumTracks(albumId: string, parameters?: OptionalAlbumParameters) {
  const result = await got(`https://api.deezer.com/album/${albumId}/tracks` + stringifyRestParams(parameters))
  const data = ConvertAlbumTracks.toAlbumTracks(result.body)

  if (!data.data) throw new Error("Album tracks are not available")

  return data
}