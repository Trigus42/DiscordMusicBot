"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const fs = __importStar(require("fs"));
const sequelize_1 = require("sequelize");
const discord_js_1 = require("discord.js");
class Config {
    /*
    * Constructor function to initialize database connection
    */
    constructor(filename, userConfig, filters) {
        this.commands = new discord_js_1.Collection();
        // Connect to database
        this.path = filename !== null && filename !== void 0 ? filename : "./config/db.sqlite";
        this.db = new sequelize_1.Sequelize({
            dialect: 'sqlite',
            storage: this.path
        });
        // Load user config
        if (userConfig) {
            if (typeof userConfig === "string") {
                // eslint-disable-next-line detect-non-literal-fs-filename
                this.userConfig = JSON.parse(fs.readFileSync(userConfig, "utf8"));
            }
            else {
                this.userConfig = userConfig;
            }
        }
        else {
            this.userConfig = JSON.parse(fs.readFileSync("./config/user_config.json", "utf8"));
        }
        // Load filters
        if (filters) {
            if (typeof filters === "string") {
                // eslint-disable-next-line detect-non-literal-fs-filename
                this.filters = JSON.parse(fs.readFileSync(filters, "utf8"));
            }
            else {
                this.filters = filters;
            }
        }
        else {
            this.filters = JSON.parse(fs.readFileSync("./config/filters.json", "utf8"));
        }
        // Don't allow modification of user config
        Object.freeze(this.userConfig);
        Object.freeze(this.filters);
        // Guilds
        class Guild extends sequelize_1.Model {
        }
        Guild.init({
            id: {
                type: sequelize_1.DataTypes.STRING,
                primaryKey: true
            },
            prefix: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                defaultValue: this.userConfig.prefix
            },
        }, { sequelize: this.db });
        Guild.sync();
        // Filters
        class Filter extends sequelize_1.Model {
        }
        Filter.init({
            guildId: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                references: { key: "id", model: Guild },
                onDelete: "CASCADE"
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                primaryKey: true
            },
            value: {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: null,
            }
        }, { sequelize: this.db });
        Filter.sync();
        // Status embeds
        class StatusEmbed extends sequelize_1.Model {
        }
        StatusEmbed.init({
            guildId: {
                type: sequelize_1.DataTypes.STRING,
                primaryKey: true,
                references: { key: "id", model: Guild },
                onDelete: "CASCADE"
            },
            channelId: {
                type: sequelize_1.DataTypes.STRING,
                primaryKey: true
            },
            messageId: {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: null,
            }
        }, { sequelize: this.db });
        StatusEmbed.sync();
    }
    async addGuild(guildId) {
        this.db.models.Guild.upsert({
            id: guildId
        });
    }
    async removeGuild(guildId) {
        await this.db.models.Guild.destroy({
            where: {
                id: guildId
            }
        });
    }
    async getFilters(guildId) {
        // Get custom guild filters from database
        const customFilters = await this.db.models.Filter.findAll({
            where: { guildId: guildId }
        }).catch(() => null);
        // Convert to dictionary
        const customFiltersDict = {};
        for (const filter of customFilters !== null && customFilters !== void 0 ? customFilters : []) {
            customFiltersDict[filter.getDataValue("name")] = filter.getDataValue("value");
        }
        // Merge default filters with custom filters, overwriting default filters in case of a conflict
        return Object.assign(Object.assign({}, this.filters), customFiltersDict);
    }
    async getFilter(guildId, name) {
        var _a, _b;
        // Get custom guild filters from database
        const customFilter = await this.db.models.Filter.findOne({
            where: { guildId: guildId, name: name }
        }).catch(() => null);
        // Return custom filter value, or default filter value if not found
        return (_b = (_a = customFilter === null || customFilter === void 0 ? void 0 : customFilter.getDataValue("value")) !== null && _a !== void 0 ? _a : this.filters[name]) !== null && _b !== void 0 ? _b : null;
    }
    async setFilter(guildId, name, value) {
        await this.addGuild(guildId);
        this.db.models.Filter.upsert({
            guildId: guildId,
            name: name,
            value: value
        });
    }
    async deleteFilter(guildId, name) {
        // Get custom guild filters from database
        await this.db.models.Filter.destroy({
            where: { guildId: guildId, name: name }
        });
    }
    async setPlayingMessage(guildId, channelId, messageId) {
        await this.addGuild(guildId);
        this.db.models.StatusEmbed.upsert({
            guildId: guildId,
            channelId: channelId,
            messageId: messageId
        });
    }
    async getPlayingMessage(guildId, channelId) {
        var _a;
        const statusEmbed = await this.db.models.StatusEmbed.findOne({
            where: {
                guildId: guildId,
                channelId: channelId
            }
        }).catch(() => null);
        return (_a = statusEmbed === null || statusEmbed === void 0 ? void 0 : statusEmbed.getDataValue("messageId")) !== null && _a !== void 0 ? _a : null;
    }
    async getPrefix(guildId) {
        var _a;
        const guild = await this.db.models.Guild.findOne({
            where: { id: guildId }
        });
        return (_a = guild === null || guild === void 0 ? void 0 : guild.getDataValue("prefix")) !== null && _a !== void 0 ? _a : this.userConfig.prefix;
    }
    async setPrefix(guildId, prefix) {
        this.db.models.Guild.upsert({
            guildId: guildId,
            prefix: prefix
        });
    }
}
exports.Config = Config;
