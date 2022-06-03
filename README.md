## Discord Music Bot

![image](https://user-images.githubusercontent.com/59501676/171850080-4e151cec-13b7-49c6-ba51-827adcbb4cfc.png)

## Features

-   Support for YouTube, Spotify and Deezer
-   Customizable audio filters
-   Control playback using buttons
-   Jump in queue and seek in a song
-   ...

## Commands

![image](https://user-images.githubusercontent.com/59501676/171848604-390e7e5a-776f-4f4e-badc-11c29fb27ba4.png)

## Setup

#### Edit `userConfig.json`

| Variable                               | Function                                                                                                                                                                | Required | Default   |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| `tokens`                               | Discord bot tokens - one or more (to join multiple voice channels)                                                                                                      | yes      |           |
| `prefix`                               | Command prefix                                                                                                                                                          | yes      |           |
| `mainClientId`                         | If you use multiple bot tokens, this client will receive (and send) messages messages                                                                                   | (yes)    |           |
| `ownerId`                              | ID of your Discord account. Allows the use of commands marked as `ownerOnly`                                                                                            | no       |           |
| `spotify` » `clientId`, `clientSecret` | [Spotify app](https://developer.spotify.com/dashboard/applications) credentails                                                                                         | no       |           |
| `youtubeCookie`                        | YouTube cookies. Read how to get it in [YTDL's Example](https://github.com/fent/node-ytdl-core/blob/997efdd5dd9063363f6ef668bb364e83970756e7/example/cookies.js#L6-L12) | no       |           |
| `youtubeIdentityToken`                 | You can find this by going to a video's watch page; viewing the source; and searching for "ID_TOKEN".                                                                   | no       |           |
| `nsfw`                                 | Whether or not to play age-restricted content and disable safe-search in non-NSFW channels.                                                                             | no       | false     |

#### Start

Run `docker-compose up -d --build`
