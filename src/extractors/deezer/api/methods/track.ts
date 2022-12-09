import got from 'got'
import { Convert as TrackConvert, Track } from '../responses/track'
import { OptionalGlobalParameters } from '../const/restParameters'
import { stringifyRestParams } from '../utils'

type OptionalTrackParameters = OptionalGlobalParameters & {}

export async function getTrack(trackId: string, parameters?: OptionalTrackParameters) {
  const response = await got(`https://api.deezer.com/track/${trackId}` + stringifyRestParams(parameters))
  const data = TrackConvert.toTrack(response.body)

  if(!data.title) throw new Error("Track is not available")

  return data
}