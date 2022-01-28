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
class DB {
    constructor(filename) {
        this.path = filename;
        this.init();
    }
    /*
    * Constructor function to initialize database connection
    */
    init() {
        // Connect to database; create if not exists
        this.db = new sql.Database(this.path, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                // Create kvstore table if not exists
                this.db.run("CREATE TABLE IF NOT EXISTS kvstore (key TEXT UNIQUE, value TEXT)", (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
    }
    /*
    * Close database connection
    */
    close() {
        return this.db.close();
    }
    /**
    * Run SQL query, return promise with results or reject with error
    */
    async run(sql, params, results) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params !== null && params !== void 0 ? params : [], (err, row) => {
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
    /**
    * Insert key-value pair in database kvstore
    */
    async put(key, value) {
        // Check if key already exists
        var exists = await this.run(`SELECT value FROM kvstore WHERE key = ?`, [key]);
        // Create new key-value pair if key does not exist
        if (!exists) {
            return this.run("INSERT INTO kvstore (key, value) VALUES (?, ?)", [key, value]);
            // Update key-value pair if key already exists and value is different
        }
        else if (exists != value) {
            return this.run("UPDATE kvstore SET value = ? WHERE key = ?", [value, key]);
        }
    }
    /**
    * Get value from key-value store from database
    * */
    async get(key, results) {
        return this.run('SELECT value FROM kvstore WHERE key = ?', [key], results);
    }
    /**
    * Delete key-value pair from database
    * */
    async del(key) {
        return this.run('DELETE FROM kvstore WHERE key = ?', [key]);
    }
}
exports.DB = DB;
