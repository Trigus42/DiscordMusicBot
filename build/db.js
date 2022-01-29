"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.DB = void 0;
const sql = __importStar(require("sqlite3"));
const fs = __importStar(require("fs"));
class DB {
    /*
    * Constructor function to initialize database connection
    */
    constructor(filename, user_config, filters) {
        // Connect to database
        this.path = filename !== null && filename !== void 0 ? filename : "./config/db.sqlite";
        this.db_connection = new sql.Database(this.path);
        // Create guilds and kvstore
        this.guilds = new Guilds(this);
        this.kvstore = new KVStore(this);
        // Load user config
        if (user_config) {
            if (typeof user_config === "string") {
                this.user_config = JSON.parse(fs.readFileSync(user_config, "utf8"));
            }
            else {
                this.user_config = user_config;
            }
        }
        else {
            this.user_config = JSON.parse(fs.readFileSync("./config/user_config.json", "utf8"));
        }
        // Load filters
        if (filters) {
            if (typeof filters === "string") {
                this.filters = JSON.parse(fs.readFileSync(filters, "utf8"));
            }
            else {
                this.filters = filters;
            }
        }
        else {
            this.filters = JSON.parse(fs.readFileSync("./config/filters.json", "utf8"));
        }
    }
    /*
    * Close database connection
    */
    close() {
        return this.db_connection.close();
    }
    /**
    * Run SQL query, return promise with results or reject with error
    */
    async run(sql, params, results) {
        return new Promise((resolve, reject) => {
            this.db_connection.get(sql, params !== null && params !== void 0 ? params : [], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (row) {
                        var res_slice = Object.values(row).slice(0, results !== null && results !== void 0 ? results : undefined);
                        // Return string if res_slice has only one element else array of strings; if res_slice is empty, return null
                        resolve((res_slice.length > 1 ? res_slice : res_slice[0]));
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    }
}
exports.DB = DB;
class KVStore {
    constructor(db) {
        this.db = db;
        // Create kvstore table if not exists
        this.db.run(`
            CREATE TABLE IF NOT EXISTS kvstore (
                key TEXT UNIQUE,
                value TEXT
                )
        `);
    }
    /**
    * Insert key-value pair in database kvstore
    */
    async put(key, value) {
        // Check if key already exists
        var exists = await this.db.run(`SELECT value FROM kvstore WHERE key = ?`, [key]);
        // Create new key-value pair if key does not exist
        if (!exists) {
            return this.db.run("INSERT INTO kvstore (key, value) VALUES (?, ?)", [key, value]);
            // Update key-value pair if key already exists and value is different
        }
        else if (exists != value) {
            return this.db.run("UPDATE kvstore SET value = ? WHERE key = ?", [value, key]);
        }
    }
    /**
    * Get value from key-value store from database
    * */
    async get(key, results) {
        return this.db.run('SELECT value FROM kvstore WHERE key = ?', [key], results);
    }
    /**
    * Delete key-value pair from database
    * */
    async del(key) {
        return this.db.run('DELETE FROM kvstore WHERE key = ?', [key]);
    }
}
class Guilds {
    constructor(db) {
        this.db = db;
        this.db.run(`
            CREATE TABLE IF NOT EXISTS guilds (
                id TEXT UNIQUE,
                prefix TEXT,
                playing_message TEXT,
                status_message TEXT
                )
            `);
    }
    async add(id) {
        return this.db.run("INSERT OR IGNORE INTO guilds (id) VALUES (?)", [id]);
    }
    async get(type, id) {
        return this.db.run(`SELECT ${type} from guilds WHERE id = ?`, [id], 1);
    }
    async set(type, value, id) {
        await this.add(id);
        return this.db.run(`UPDATE guilds SET ${type} = ? WHERE id = ?`, [value, id]);
    }
    async del(id) {
        return this.db.run("DELETE FROM guilds WHERE id = ?", [id]);
    }
    async getPrefix(id) {
        var _a;
        return (_a = (await this.get("prefix", id))) !== null && _a !== void 0 ? _a : this.db.user_config.prefix;
    }
}
