import express from 'express';
import formidable from 'express-formidable';

class Server {
  public app: express.Application;
  public port: number;
 
  constructor(controllers: Array<any>, port: number) {
    this.app = express();
    this.port = port;
 
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
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
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is running at http://localhost:${this.port}`);
    });
  }
}

export default Server;