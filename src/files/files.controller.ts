import { Request, Response, NextFunction } from 'express';
import https from 'https';
import { validationResult } from 'express-validator';
import { IncomingMessage } from 'http';
import { ReadStream, WriteStream } from 'fs';
import ApplicationError from '../utils/Error';
import FileService from './files.service';
import { UserService } from '../users/users.service';
import {
  IGetFilesParams,
  IUpdateFileBody,
} from '../middleware/validators/types';
import { prepareValidationErrorMessage } from '../utils/validation-error';
import { FileInfo } from './types/file-info';
import { TelegramDocument } from '../bot/types/telegram-file.type';
import {
  fetchAndSendChunks,
  handleCloseEvent,
  handleFieldEvent,
  handleFileEvent,
} from '../utils/file-upload';

class FileController {
  private fileService: FileService;
  private userService: UserService;

  constructor(fileService: FileService, userService: UserService) {
    this.fileService = fileService;
    this.userService = userService;
  }

  public download = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.query.id as string;

      if (!id) throw ApplicationError.BadRequest('File id not passed');

      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw ApplicationError.Unauthorized(
          'User not have permission to access this file',
        );

      const savedFile = await this.fileService.download(id, candidate._id);

      https.get(savedFile.link!, async function (file: IncomingMessage) {
        res.set(
          'Content-disposition',
          'attachment; filename=' + encodeURI(savedFile.name),
        );

        file.pipe(res);

        // await DataEncode.decryptWithStream(
        //   file as unknown as ReadStream,
        //   res as unknown as WriteStream,
        //   savedFile.secret,
        // );
      });
    } catch (e: unknown) {
      next(e);
    }
  };

  public downloadLarge = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const id = req.query.id as string;

      if (!id) throw ApplicationError.BadRequest('File id not passed');

      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw ApplicationError.Unauthorized(
          'User not have permission to access this file',
        );

      const savedFile = await this.fileService.downloadLarge(id, candidate._id);

      res.set(
        'Content-disposition',
        'attachment; filename=' + encodeURI(savedFile.name),
      );

      await fetchAndSendChunks(savedFile.chunks, res as unknown as WriteStream);
    } catch (e: unknown) {
      next(e);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sortBy, parent } = req.query as unknown as IGetFilesParams;
      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw ApplicationError.Unauthorized(
          'User not have permission to access this file',
        );

      const files = await this.fileService.getAll(
        candidate._id,
        parent,
        sortBy,
      );

      return res.send(files);
    } catch (e: unknown) {
      next(e);
    }
  };

  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileId = req.params.id;
      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw ApplicationError.Unauthorized(
          'User not have permission to access this file',
        );

      const file = await this.fileService.getOne(fileId, candidate._id);

      return res.send(file);
    } catch (e: unknown) {
      next(e);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw ApplicationError.Unauthorized(
          'User not have permission to access this file',
        );

      const reqBodyLength = Number(req.headers['content-length']);
      // 172 - the size of content length when the "file" field is empty
      if (reqBodyLength <= 172) {
        throw ApplicationError.BadRequest('File or required fields not passed');
      }

      req.pipe(req.busboy);

      const savedChunks: TelegramDocument[] = [];
      let fileName: string;
      let saveChunks: Promise<void>;
      const fieldEventState = {} as {
        fileDirectory: string;
        isDirectory: boolean;
        directoryName: string;
      };

      req.busboy.on(
        'file',
        async (name: string, file: ReadStream, info: FileInfo) => {
          fileName = info.filename;
          saveChunks = handleFileEvent(
            file,
            savedChunks,
            this.fileService.saveLargeFileChunk.bind(this.fileService),
          );
        },
      );

      req.busboy.on('field', (name: string, val: string, info) => {
        handleFieldEvent(name, val, fieldEventState, next);
      });

      await new Promise<void>((resolve, reject) => {
        req.busboy.on('close', async () => {
          try {
            if (fieldEventState.isDirectory) {
              // when name field is ommited
              fieldEventState.directoryName ||
                (() => {
                  throw ApplicationError.BadRequest(
                    'Name must be not empty string when creating a directory',
                  );
                })();

              const directory = await this.fileService.createDirectory(
                fieldEventState.directoryName,
                candidate._id,
                fieldEventState.fileDirectory,
              );

              return res.send(directory);
            }

            await saveChunks;
            await handleCloseEvent(
              fileName,
              candidate._id,
              savedChunks,
              res,
              this.fileService.create.bind(this.fileService),
              fieldEventState.fileDirectory,
            );
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApplicationError.BadRequest(
          prepareValidationErrorMessage(errors.array()),
        );
      }

      const { parent, name }: IUpdateFileBody = req.body;
      const fileId = req.params.id;

      if (!fileId) throw ApplicationError.BadRequest('File id is required');

      if (!parent && !name)
        throw ApplicationError.BadRequest('File name or parent is required');

      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw ApplicationError.Unauthorized(
          'User not have permission to access this file',
        );

      const updatedFile = await this.fileService.update(
        fileId,
        candidate._id,
        name,
        parent,
      );

      return res.send(updatedFile);
    } catch (e) {
      next(e);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params?.id;

      if (!id) throw ApplicationError.BadRequest('File id is required');

      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw ApplicationError.Unauthorized(
          'User not have permission to access this file',
        );

      const file = await this.fileService.delete(id, candidate._id);

      return res.status(204).send('');
    } catch (e) {
      next(e);
    }
  };
}

export default FileController;
