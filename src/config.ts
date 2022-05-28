import * as fs from "fs"
import { Sequelize, DataTypes, Model } from "sequelize"
import { UserConfig, Dict } from "./interfaces"
import { Command } from "./classes/command"
import { Collection } from "discord.js"

export class Config {
	path: string
	db: Sequelize

	userConfig: UserConfig
	filters: Dict
	commands: Collection<string, Command> = new Collection()

	/*
    * Constructor function to initialize database connection
    */
	constructor (filename?: string, userConfig?: UserConfig|string, filters?: Dict|string) {
		// Connect to database
		this.path = filename ?? "./config/db.sqlite"
		this.db = new Sequelize({
			dialect: "sqlite",
			storage: this.path
		})

		// Load user config
		if (userConfig) {
			if (typeof userConfig === "string") {
				// eslint-disable-next-line detect-non-literal-fs-filename
				this.userConfig = JSON.parse(fs.readFileSync(userConfig, "utf8")) as UserConfig
			} else {
				this.userConfig = userConfig
			}
		} else {
			this.userConfig = JSON.parse(fs.readFileSync("./config/user_config.json", "utf8")) as UserConfig
		}

		// Load filters
		if (filters) {
			if (typeof filters === "string") {
				// eslint-disable-next-line detect-non-literal-fs-filename
				this.filters = JSON.parse(fs.readFileSync(filters, "utf8"))
			} else {
				this.filters = filters
			}
		} else {
			this.filters = JSON.parse(fs.readFileSync("./config/filters.json", "utf8"))
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
}