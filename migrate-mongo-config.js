const dotent = require('dotenv').config();

const DB_URL = process.env.MONGODB_URI;

const config = {
  mongodb: {
    url: DB_URL,

    options: {
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
    }
  },

  migrationsDir: "migrations",

  changelogCollectionName: "changelog",

  migrationFileExtension: ".ts",

  useFileHash: false,

  moduleSystem: 'commmonjs',
};

module.exports = config;
