import { Config } from "./config"
import { createClients } from "./createClients"

/////////////////
/// Initialize //
/////////////////

const config = new Config()
const clients = createClients(config)

