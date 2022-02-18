## Simple Discord Music Bot

![Screenshot_20220210_165620](https://user-images.githubusercontent.com/59501676/153449381-42ac153b-2456-4a46-b726-2c1677866b16.png)

## Features

-   Support for YouTube, Spotify and Deezer
-   Customizable audio filters
-   Control playback using buttons
-   Jump in queue and seek in a song

## Commands

![Screenshot_20220217_085702](https://user-images.githubusercontent.com/59501676/154431086-d05dfbb9-7adb-4f90-be3c-3cce9c7efd70.png)

## Setup

#### Edit user_config.json:

| Variable                                 | Function                                                                                                                                                                | Required | Default   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| `token`                                  | Discord bot token                                                                                                                                                       | yes      |           |
| `prefix`                                 | Command prefix                                                                                                                                                          | yes      |           |
| `action_messages`                        | Whether to send feedback if user interacts with buttons                                                                                                                 | yes      |           |
| `spotify` » `client_id`, `client_secret` | [Spotify app](https://developer.spotify.com/dashboard/applications) credentails                                                                                         | no       |           |
| `youtubeCookie`                          | YouTube cookies. Read how to get it in [YTDL's Example](https://github.com/fent/node-ytdl-core/blob/997efdd5dd9063363f6ef668bb364e83970756e7/example/cookies.js#L6-L12) | no       | undefined |
| `youtubeIdentityToken`                   | If not given; ytdl-core will try to find it. You can find this by going to a video's watch page; viewing the source; and searching for "ID_TOKEN".                      | no       | undefined |
| `nsfw`                                   | Whether or not playing age-restricted content and disabling safe search in non-NSFW channel.                                                                            | no       | false     |

#### Start:

Run `docker-compose up -d --build`
