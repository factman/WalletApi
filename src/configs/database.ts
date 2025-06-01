import Knex from "knex";

import knexConfig from "../../knexfile";
import { env } from "./env";

export default Knex(knexConfig[env.NODE_ENV]);
