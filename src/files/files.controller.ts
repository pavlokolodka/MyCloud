import { Request, Response, NextFunction } from 'express';
import https from 'https';
import { validationResult } from 'express-validator';
import { IncomingMessage } from 'http';
import { ReadStream, WriteStream } from 'fs';
import { HttpError } from '../utils/Error';
import FileService from './files.service';
import DataEncode from '../utils/file-encryption/encrypt';
import { UserService } from '../users/users.service';
import {
  IGetFilesParams,
  IUpdateFileBody,
} from '../middleware/validators/types';
import { prepareValidationErrorMessage } from '../utils/validation-error';
import { IFileMetadata } from './dto/file-metadata.dto';
import { IFile } from './model/files.interface';
import { FileInfo } from './types/file-info';
import { TelegramDocument } from '../bot/types/telegram-file.type';
import { fetchAndSendChunks, handleFileEvent } from '../utils/file-upload';

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

      if (!id) throw new HttpError('File id not passed', 400);

      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw new HttpError(
          'User not have permission to access this file',
          403,
        );

      const savedFile = await this.fileService.download(id, candidate._id);

      https.get(savedFile.link!, async function (file: IncomingMessage) {
        res.set(
          'Content-disposition',
          'attachment; filename=' + encodeURI(savedFile.name),
        );

        await DataEncode.decryptWithStream(
          file as unknown as ReadStream,
          res as unknown as WriteStream,
          savedFile.secret,
        );
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

      if (!id) throw new HttpError('File id not passed', 400);

      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw new HttpError(
          'User not have permission to access this file',
          403,
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
        throw new HttpError(
          'User not have permission to access this file',
          403,
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
        throw new HttpError(
          'User not have permission to access this file',
          403,
        );

      const file = await this.fileService.getOne(fileId, candidate._id);

      return res.send(file);
    } catch (e: unknown) {
      next(e);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw new HttpError(prepareValidationErrorMessage(errors.array()), 400);
      }

      const reqFile = req.files?.file as unknown as IFileMetadata;
      const parent = req.fields?.parent as string;
      const type = req.fields?.type as string;
      const directoryName = req.fields?.name as string;

      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw new HttpError(
          'User not have permission to access this file',
          403,
        );

      let file: IFile;

      if (type) {
        // check if the file was also uploaded
        if (reqFile) {
          await this.fileService.deleteFromDisk(reqFile.path);
        }

        file = await this.fileService.createDirectory(
          directoryName,
          candidate._id,
          parent,
        );
      } else {
        if (!reqFile) {
          throw new HttpError('File not passed', 400);
        }

        file = await this.fileService.create(reqFile, candidate._id, parent);
      }

      return res.send(file);
    } catch (e: unknown) {
      next(e);
    }
  };

  public createLargeFile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw new HttpError(
          'User not have permission to access this file',
          403,
        );

      const savedChunks: TelegramDocument[] = [];
      let fileName: string;
      let saveLastChunk: Promise<void>;

      const fn = (name: string, file: ReadStream, info: FileInfo) => {
        handleFileEvent(
          name,
          file,
          info,
          fileName,
          savedChunks,
          saveLastChunk,
          this.fileService.saveLargeFileChunk.bind(this).bind(this),
        );
      };
      // req.busboy.on(
      //   'file',
      //  fn)

      // register file listeners
      req.busboy.on(
        'file',
        async (name: string, file: ReadStream, info: FileInfo) => {
          const highWaterMark = 20 * 1024 * 1024;
          fileName = info.filename;
          let currentChunkSize = 0;
          let rawFileData: Buffer[] = [];

          await new Promise<void>((resolve) => {
            file
              .on('data', async (data: Buffer) => {
                if (
                  currentChunkSize < highWaterMark &&
                  currentChunkSize + Buffer.byteLength(data) <= highWaterMark
                ) {
                  currentChunkSize += Buffer.byteLength(data);
                  rawFileData.push(data);
                } else {
                  // pause data emitting
                  file.pause();

                  const savedChunk = await this.fileService.saveLargeFileChunk(
                    Buffer.concat(rawFileData),
                  );

                  savedChunks.push(savedChunk);

                  // save the lash data chunk from current stream
                  currentChunkSize = Buffer.byteLength(data);
                  rawFileData = [];
                  rawFileData.push(data);

                  // resume emitting the data stream
                  file.resume();
                }
              })
              .on('close', async () => {
                // save last chunk data before closing the stream
                if (rawFileData.length) {
                  // eslint-disable-next-line no-async-promise-executor
                  saveLastChunk = new Promise<void>(async (resolve) => {
                    const savedChunk =
                      await this.fileService.saveLargeFileChunk(
                        Buffer.concat(rawFileData),
                      );

                    savedChunks.push(savedChunk);

                    currentChunkSize = 0;
                    rawFileData = [];

                    resolve();
                  });
                }

                resolve();
              });
          });
        },
      );

      req.busboy.on('close', async () => {
        await saveLastChunk;

        const chunkIds: string[] = [];
        let size = 0;

        savedChunks.forEach((chunk: TelegramDocument) => {
          size += chunk.document.file_size;
          chunkIds.push(chunk.document.file_id);
        });

        const file = await this.fileService.createLargeFile(
          fileName,
          size,
          chunkIds,
          candidate._id,
        );

        res.send(file);
      });

      // pass the request stream through the busboy middleware
      req.pipe(req.busboy);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw new HttpError(prepareValidationErrorMessage(errors.array()), 400);
      }

      const { parent, name }: IUpdateFileBody = req.body;
      const fileId = req.params.id;

      if (!fileId) throw new HttpError('File id is required', 400);

      if (!parent && !name)
        throw new HttpError('name or parent is required', 400);

      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw new HttpError(
          'User not have permission to access this file',
          403,
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

      if (!id) throw new HttpError('File id is required', 400);

      const userId = req.user.id;
      const candidate = await this.userService.getUserById(userId);

      if (!candidate)
        throw new HttpError(
          'User not have permission to access this file',
          403,
        );

      const file = await this.fileService.delete(id, candidate._id);

      return res.status(204).send('');
    } catch (e) {
      next(e);
    }
  };
}

export default FileController;
