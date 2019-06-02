const config = {
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  },
};

export {
  config,
};
