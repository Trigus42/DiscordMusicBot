import * as fs from "fs"
import { Sequelize, DataTypes, Model } from "sequelize"
import { UserConfig, Dict } from "./interfaces/structs"
import { Command } from "./classes/command"
import { Collection } from "discord.js"
import { Playlist } from "./classes/playlist"
import { Player } from "./player"
import * as Discord from "discord.js"
import * as path from "path"

export class Config {
	dbPath: string
	db: Sequelize

	configDir: string
	userConfig: UserConfig
	filters: Dict
	commands: Collection<string, Command> = new Collection()
	startTimes: Collection<string, number> = new Collection()
	clients: Discord.Client[] = []
	activeQueues: Map<string, Player[]> = new Map<string, Player[]>()
	timeLastPlayStart: Dict = {}

	/**
    * Constructor function to initialize database connection
	* @param {String} [configDir="config"] - Path of config directory
	* @param {String|Sequelize} [db="db.sqlite"] - Path of db file or Sequelize object
	* @param {UserConfig|string} [userConfig="userConfig.json"] - Path of userConfig file or UserConfig object
	* @param {Dict|string} [filters=filters.json] - Path of filters file or Dict object
	* @returns {Config} Config object
    */
	constructor (configDir?: string, db?: string|Sequelize, userConfig?: UserConfig|string, filters?: Dict|string) {
		// Default args
		this.configDir = configDir ? path.normalize(configDir) : "config"
		db = !db ? path.join(this.configDir, "db.sqlite") : db
		filters = !filters ? path.join(this.configDir, "filters.json") : filters
		userConfig = !userConfig ? path.join(this.configDir, "userConfig.json") : userConfig

		// Load user config
		if (typeof userConfig === "string") {
			fs.mkdirSync(path.dirname(userConfig), {recursive: true})
			this.userConfig = JSON.parse(fs.readFileSync(path.normalize(userConfig), "utf8")) as UserConfig
		} else if (typeof userConfig === "object") {
			this.userConfig = userConfig
		}

		// Load filters
		if (typeof filters === "string") {
			fs.mkdirSync(path.dirname(filters), {recursive: true})
			this.filters = JSON.parse(fs.readFileSync(path.normalize(filters), "utf8")) as Dict
		} else if (typeof filters === "object"){
			this.filters = filters
		}

		// Connect to database
		if (typeof db === "string") {
			fs.mkdirSync(path.dirname(db), {recursive: true})
			this.db = new Sequelize({dialect: "sqlite", storage: path.normalize(db), logging: false})
			this.dbPath = path.normalize(db)
		} else if (typeof filters === "object"){
			this.db = db
		}

		// Don't allow modification of user config
		Object.freeze(this.userConfig)
		Object.freeze(this.filters)

		// Guilds
		class Guild extends Model {
			declare id: string
		}
        
		Guild.init({
			id: {
				type: DataTypes.STRING,
				primaryKey: true
			},
			prefix: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: this.userConfig.prefix
			},
		}, {sequelize: this.db})

		Guild.sync()

		// Filters
		class Filter extends Model {
			declare guildId: string
			declare name: string
			declare value: string
		}
        
		Filter.init({
			guildId: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				references: {key: "id", model: Guild},
				onDelete: "CASCADE"
			},
			name: {
				type: DataTypes.STRING,
				primaryKey: true
			},
			value: {
				type: DataTypes.STRING,
				defaultValue: null,
			}
		}, {sequelize: this.db})

		Filter.sync()

		// Status embeds
		class StatusEmbed extends Model {
			declare guildId: string
			declare channelId: string
			declare messageId: string
		}
        
		StatusEmbed.init({
			guildId: {
				type: DataTypes.STRING,
				primaryKey: true,
				references: {key: "id", model: Guild},
				onDelete: "CASCADE"
			},
			channelId: {
				type: DataTypes.STRING,
				primaryKey: true
			},
			messageId: {
				type: DataTypes.STRING,
				defaultValue: null,
			}
		}, {sequelize: this.db})

		StatusEmbed.sync()

		class Playlist extends Model {
			declare userId: string
			declare name: string
			declare tracks: string
		}
        
		Playlist.init({
			name: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			userId: {
				type: DataTypes.STRING,
				primaryKey: true
			},
			tracks: {
				type: DataTypes.STRING,
				defaultValue: null,
			}
		}, {sequelize: this.db})

		Playlist.sync()
	}

	async addGuild(guildId: string): Promise<void> {
		this.db.models.Guild.upsert({
			id: guildId
		})
	}

	async removeGuild(guildId: string): Promise<void> {
		await this.db.models.Guild.destroy({
			where: {
				id: guildId
			}
		})
	}

	async getFilters(guildId: string): Promise<Dict> {
		// Get custom guild filters from database
		const customFilters = await this.db.models.Filter.findAll({
			where: {guildId: guildId}
		}).catch(() => null)

		// Convert to dictionary
		const customFiltersDict: Dict = {}
		for (const filter of customFilters ?? []) {
			customFiltersDict[filter.getDataValue("name")] = filter.getDataValue("value")
		}

		// Merge default filters with custom filters, overwriting default filters in case of a conflict
		return Object.assign(Object.assign({}, this.filters), customFiltersDict)
	}

	async getFilter(guildId: string, name: string): Promise<string|null> {
		// Get custom guild filters from database
		const customFilter = await this.db.models.Filter.findOne({
			where: {guildId: guildId, name: name}
		}).catch(() => null)

		// Return custom filter value, or default filter value if not found
		return customFilter?.getDataValue("value") ?? this.filters[name] ?? null
	}

	async setFilter(guildId: string, name: string, value: string): Promise<void> {
		await this.addGuild(guildId)

		this.db.models.Filter.upsert({
			guildId: guildId,
			name: name,
			value: value
		})
	}

	async deleteFilter(guildId: string, name: string): Promise<void> {
		// Get custom guild filters from database
		await this.db.models.Filter.destroy({
			where: {guildId: guildId, name: name}
		})
	}

	async setPlayingMessage(guildId: string, channelId: string, messageId: string): Promise<void> {
		await this.addGuild(guildId)

		this.db.models.StatusEmbed.upsert({
			guildId: guildId,
			channelId: channelId,
			messageId: messageId
		})
	}

	async getPlayingMessage(guildId: string, channelId: string): Promise<string|null> {
		const statusEmbed = await this.db.models.StatusEmbed.findOne({
			where: {
				guildId: guildId,
				channelId: channelId
			}
		}).catch(() => null)

		return statusEmbed?.getDataValue("messageId") ?? null
	}

	async getPrefix(guildId: string): Promise<string> {
		const guild = await this.db.models.Guild.findOne({
			where: {id: guildId}
		})

		return guild?.getDataValue("prefix") ?? this.userConfig.prefix
	}

	async setPrefix(guildId: string, prefix: string): Promise<void> {
		this.db.models.Guild.upsert({
			guildId: guildId,
			prefix: prefix
		})
	}

	async getPlaylist(userId: string, name: string): Promise<Playlist> {
		const playlist = await this.db.models.Playlist.findOne({
			where: {
				userId: userId,
				name: name
			}
		}).catch(() => null)

		if (!playlist) {
			return new Playlist(name, [], userId, this.db)
		} else {
			return new Playlist(name, JSON.parse(playlist.getDataValue("tracks")), userId, this.db)
		}
	}

	async getPlaylists(userId: string): Promise<Playlist[]> {
		const playlists = await this.db.models.Playlist.findAll({
			where: {
				userId: userId
			}
		})

		if (!playlists) {
			return []
		} else {
			return playlists.map(playlist => new Playlist(
				playlist.getDataValue("name"),
				JSON.parse(playlist.getDataValue("tracks")),
				userId,
				this.db
			))
		}
	}
}