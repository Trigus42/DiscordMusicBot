import { Sequelize } from "sequelize/types";

export class Playlist{
    public name: string
    readonly tracks: string[]
    public owner: string
    private db: Sequelize

    constructor(name: string, tracks: string[], owner: string, db: Sequelize){
        this.name = name
        this.tracks = tracks
        this.owner = owner
        this.db = db
    }

    public async addTracks(tracks: string[]){
        this.tracks.push(...tracks)
        this.db.models.Playlist.upsert({
            userId: this.owner,
            name: this.name,
            tracks: JSON.stringify(this.tracks)
        })
    }

    public async removeTrack(trackIndex: number){
        this.tracks.splice(trackIndex, 1)
        this.db.models.Playlist.upsert({
            userId: this.owner,
            name: this.name,
            tracks: JSON.stringify(this.tracks)
        })
    }

    public async delete(){
        this.db.models.Playlist.destroy({
            where: {
                userId: this.owner,
                name: this.name
            }
        })
    }
}