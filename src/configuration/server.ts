import express, { Request, Response } from 'express';
import * as fs from 'fs';
import path from 'path';
import { ConnectToDb } from './database-connection';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

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
    this.initializeDocs();
    this.connectToDb();
  }

  private initializeMiddlewares() {
    if (!fs.existsSync(path.resolve('src', 'storage')))
      fs.mkdirSync(path.resolve('src', 'storage'));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  private initializeDocs() {
    const options: swaggerJSDoc.Options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'MyCloud API',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      apis: [
        path.resolve('src') + '/*/*.controller.ts',
        path.resolve('src') + '/*/dto/*.dto.ts',
        path.resolve('src') + '/*/model/*.model.ts',
        path.resolve('src') + '/utils/Error.ts',
      ],
    };

    console.log(path.resolve('src') + '/utils/Error.ts');
    const swaggerSpec = swaggerJSDoc(options);

    this.app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.get('/api.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
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
