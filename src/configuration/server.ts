import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { ConnectToDb } from './database-connection';
import { errorHandler } from '../middleware/error';
import logger from '../utils/logger';
import { loggerMiddleware } from '../middleware/logger';
import { Sentry } from '../../sentry';

class Server {
  public app: express.Application;
  public port: number;
  private db: ConnectToDb;

  constructor(controllers: Array<any>, port: number) {
    this.app = express();
    this.port = port;
    this.db = ConnectToDb.getDB();

    this.connectToDb();
    this.initializeBeforeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeDocs();
    this.initializeAfterMiddlewares();
  }

  private initializeBeforeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(loggerMiddleware);
    this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(Sentry.Handlers.tracingHandler());
  }

  private initializeAfterMiddlewares() {
    this.app.use(errorHandler);
  }

  private initializeDocs() {
    const options: swaggerJSDoc.Options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'MyCloud API',
          version: '0.0.1',
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
        servers: [
          { url: 'http://localhost:5000/v1', description: 'Localhost' },
          {
            url: 'https://test-cloud-ddxe.onrender.com/v1',
            description: 'Main server',
          },
        ],
      },
      apis: [
        path.resolve('src') + '/*/*.router.ts',
        path.resolve('src') + '/*/dto/*.dto.ts',
        path.resolve('src') + '/*/model/*.model.ts',
        path.resolve('src') + '/utils/Error.ts',
        path.resolve('src') + '/middleware/validators/types.ts',
      ],
    };

    const swaggerSpec = swaggerJSDoc(options);

    this.app.use('/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.get('/v1/docs.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  private initializeControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use('/v1', controller.router);
    });
  }

  private connectToDb() {
    this.db.connect();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`Server is running at http://localhost:${this.port}`);
    });
  }
}

export default Server;
