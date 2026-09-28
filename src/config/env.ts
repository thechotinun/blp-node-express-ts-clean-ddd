import 'dotenv/config';
import { parseEnv, type Env } from './env.schema.js';

export const env: Env = parseEnv(process.env);
