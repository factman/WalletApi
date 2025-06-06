import Knex from "knex";

import knexConfig from "../../knexfile.js";
import { env } from "./env.js";

export default Knex(knexConfig[env.NODE_ENV]);
