import * as express from 'express';
import { postgraphile } from 'postgraphile';
import * as cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '../.env'
});

const app = express();
app.use(cors());

const connection = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

app.use(postgraphile(connection, 'public', {
  graphiql: true,
  enableCors: true,
}));

app.listen(5000);
