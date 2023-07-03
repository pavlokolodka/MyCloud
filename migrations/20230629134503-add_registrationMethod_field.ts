import { ConnectToDb } from '../src/configuration/database-connection';
import { RegistrationType } from '../src/users/model/users.interface';
import { User } from '../src/users/model/users.model';

export = {
  async up() {
    const databaseConnection = ConnectToDb.getDB();
    await databaseConnection.connect();

    await User.updateMany(
      { registrationMethod: { $exists: false } },
      { $set: { registrationMethod: RegistrationType.Email } },
      { multi: true },
    );
    await databaseConnection.disconnect();
  },
  async down() {
    const databaseConnection = ConnectToDb.getDB();
    await databaseConnection.connect();
    await User.updateMany({}, { $unset: { registrationMethod: 1 } });
    await databaseConnection.disconnect();
  },
};
