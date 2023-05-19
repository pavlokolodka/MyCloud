import { ConnectToDb } from '../src/configuration/database-connection';
import { User } from '../src/users/model/users.model';

export = {
  async up() {
    const databaseConnection = ConnectToDb.getDB();
    await databaseConnection.connect();

    await User.updateMany({}, { $set: { isVerified: false } });
  },

  async down() {
    const databaseConnection = ConnectToDb.getDB();
    await databaseConnection.connect();

    await User.updateMany({}, { $unset: { isVerified: '' } });
  },
};
