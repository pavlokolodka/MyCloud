import express from 'express';
import formidable from 'express-formidable';
import { ConnectToDb } from './database-connection'; 


class Server {
  public app: express.Application;
  public port: number;
  private db: ConnectToDb;
 
  constructor(controllers: Array<any>, port: number) {
    this.app = express();
    this.port = port;
    this.db = ConnectToDb.getDB();
    
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.connectToDb();
  }
 
  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));
    this.app.use(formidable());
  }
 
  private initializeControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use('/', controller.router);
    });
  }

  private connectToDb() {
    this.db.connect();
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is running at http://localhost:${this.port}`);
    });
  }
}

export default Server;