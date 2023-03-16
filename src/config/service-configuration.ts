export default () => ({
  service: {
    port: process.env.SERVICE_PORT,
    node_env: process.env.NODE_ENV,
  },
  database: {
    TYPEORM_USERNAME: process.env.TYPEORM_USERNAME,
    TYPEORM_PASSWORD: process.env.TYPEORM_PASSWORD,
    TYPEORM_DATABASE: process.env.TYPEORM_DATABASE,
    db_rotating_key: process.env.DB_ROTATING_KEY,
  },
});
