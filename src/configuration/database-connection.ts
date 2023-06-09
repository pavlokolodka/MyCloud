import mongoose from 'mongoose';
import logger from '../utils/logger';

export class ConnectToDb {
  private URI = process.env.MONGODB_URI!;
  private static instance: ConnectToDb;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getDB() {
    if (!ConnectToDb.instance) {
      ConnectToDb.instance = new ConnectToDb();
    }

    return ConnectToDb.instance;
  }

  public connect() {
    mongoose.connect(this.URI, () => {
      logger.info('Connected to database');
    });
  }
}

export class Disconnect {
  private static instance: Disconnect;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getDB() {
    if (!Disconnect.instance) {
      Disconnect.instance = new Disconnect();
    }

    return Disconnect.instance;
  }

  public disconnect() {
    mongoose.disconnect();
  }
}
