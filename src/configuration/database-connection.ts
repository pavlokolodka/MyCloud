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

  public async connect() {
    await mongoose.connect(this.URI);
    logger.info('Connected to database');
  }

  public async disconnect() {
    await mongoose.disconnect();
  }
}
