import { db } from '../db';
import { config } from '../config';

db.query(`
CREATE TABLE
  entries
  (
    id uuid NOT NULL,
    text character varying,
    "time" integer,
    CONSTRAINT entries_pk PRIMARY KEY (id)
  )`)
  .then((response) => {
    console.log(response);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

