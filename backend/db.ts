import { Client } from 'pg';
import { config } from './config';

const db = new Client({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: Number(config.db.port),
});

db.connect();

export {
  db,
}
