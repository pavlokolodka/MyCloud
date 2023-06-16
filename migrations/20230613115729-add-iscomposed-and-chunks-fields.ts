import { ConnectToDb } from '../src/configuration/database-connection';
import { File } from '../src/files/model/files.model';

export = {
  async up() {
    const databaseConnection = ConnectToDb.getDB();
    await databaseConnection.connect();

    await File.updateMany(
      { isComposed: { $exists: false }, chunks: { $exists: false } },
      { $set: { isComposed: false, chunks: null } },
      { multi: true },
    );
  },

  async down() {
    const databaseConnection = ConnectToDb.getDB();
    await databaseConnection.connect();

    await File.updateMany(
      { isComposed: { $exists: true }, chunks: { $exists: true } },
      { $unset: { isComposed: '', chunks: '' } },
      { multi: true },
    );
  },
};
