import { Router, Request, Response } from 'express';
import https from 'https';
import { validationResult } from 'express-validator';
import { IncomingMessage } from 'http';
import { ReadStream, WriteStream } from 'fs';
import { HttpError } from '../utils/Error';
import FileService from './files.service';
import { uploadMiddlware } from '../middleware/uploadMiddleware';
import { ICreateDirectoryDto } from './dto/create-directory.dto';
import { IGetFilesDto } from './dto/get-files.dto';
import {
  directoryValidation,
  updateFileValidation,
} from '../middleware/validators/validator';
import DataEncode from '../utils/file-encryption/encrypt';
import { UserService } from '../users/users.service';
import { extractUserEmail } from '../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: API for managing files
 */
class FileController {
  private path = '/files';
  public router = Router();
  private fileService: FileService;
  private userService: UserService;

  constructor() {
    this.fileService = new FileService();
    this.userService = new UserService();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    /**
     * @swagger
     * /files/download:
     *   get:
     *     tags: [Files]
     *     summary: Download a file
     *     produces:
     *       - application/octet-stream
     *     parameters:
     *       - in: query
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the file to download.
     *     responses:
     *       '200':
     *         description: Returns the requested file.
     *         content:
     *           application/octet-stream:
     *             schema:
     *               type: string
     *       400:
     *         description: The ID parameter was not passed.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *               properties:
     *                 error:
     *                   type: string
     *                   example: 'ID parameter is missing'
     *       401:
     *         description: The authorization token was not provided.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *               properties:
     *                 error:
     *                   type: string
     *                   example: 'Authorization token is required'
     *       403:
     *         description: Forbidden
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 403
     *                   error: User not have permission to access this file
     *       404:
     *         description: The requested file could not be found.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 404
     *                   error: File not found
     *       500:
     *         description: An error occurred while downloading the file.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     */
    this.router.get(
      `${this.path}/download`,
      extractUserEmail,
      async (req: Request, res: Response) => {
        try {
          const id = req.query.id as string;

          if (!id) throw new HttpError('file id not passed', 400);

          const email = req.user.email;
          const candidate = await this.userService.checkEmail(email);

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
        } catch (e) {
          if (!(e instanceof HttpError)) return res.send(e);
          return res
            .status(e.status)
            .send({ message: e.message, status: e.status });
        }
      },
    );

    /**
     * @swagger
     * /files:
     *   get:
     *     summary: Get all files
     *     tags: [Files]
     *     parameters:
     *       - $ref: '#/components/parameters/sortByParam'
     *       - $ref: '#/components/parameters/parentParam'
     *     responses:
     *       200:
     *         description: Array of file objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/File'
     *       400:
     *         description: Bad request, missing or invalid parameters
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: Invalid or missing parameters
     *       401:
     *         description: Unauthorized, token is required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 401
     *                   error: Authorization token is required
     *       403:
     *         description: Forbidden
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 403
     *                   error: User not have permission to access this file
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     */
    this.router.get(
      this.path,
      extractUserEmail,
      async (req: Request, res: Response) => {
        try {
          const { sortBy, parent }: IGetFilesDto =
            req.query as unknown as IGetFilesDto;
          const email = req.user.email;
          const candidate = await this.userService.checkEmail(email);

          if (!candidate)
            throw new HttpError(
              'User not have permission to access this file',
              403,
            );

          const files = await this.fileService.getAll(
            sortBy,
            parent,
            candidate._id,
          );

          return res.send(files);
        } catch (e: unknown) {
          if (!(e instanceof HttpError)) return res.send(e);
          return res
            .status(e.status)
            .send({ message: e.message, status: e.status });
        }
      },
    );

    /**
     * @swagger
     * /files/{id}:
     *   get:
     *     summary: Get a file by ID
     *     tags: [Files]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID of the file to retrieve
     *     responses:
     *       200:
     *         description: The requested file
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/File'
     *       400:
     *         description: Bad request, missing or invalid parameters
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: Invalid or missing parameters
     *       401:
     *         description: Unauthorized, token is required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 401
     *                   error: Authorization token is required
     *       403:
     *         description: The user does not have permission to access this file
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               forbidden:
     *                 value:
     *                   status: 403
     *                   message: User not have permission to access this file
     *       404:
     *         description: The requested file could not be found.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 404
     *                   error: File not found
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     */
    this.router.get(
      `${this.path}/:id`,
      extractUserEmail,
      async (req: Request, res: Response) => {
        try {
          const fileId = req.params.id;
          const email = req.user.email;
          const candidate = await this.userService.checkEmail(email);

          if (!candidate)
            throw new HttpError(
              'User not have permission to access this file',
              403,
            );

          const file = await this.fileService.getOne(fileId, candidate._id);

          return res.send(file);
        } catch (e: unknown) {
          if (!(e instanceof HttpError)) return res.send(e);
          return res
            .status(e.status)
            .send({ message: e.message, status: e.status });
        }
      },
    );

    /**
     * @swagger
     * /files/directory:
     *   post:
     *     summary: Create a new directory.
     *     tags: [Files]
     *     requestBody:
     *       required: true
     *       description: The request body for creating a new directory type of ICreateDirectoryDto.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ICreateDirectoryDto'
     *     responses:
     *       200:
     *         description: A new directory has been created.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/File'
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: validation error
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 401
     *                   error: Authorization token is required
     *       403:
     *         description: Forbidden
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 403
     *                   error: User not have permission to access this file
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     */
    this.router.post(
      `${this.path}/directory`,
      extractUserEmail,
      directoryValidation,
      async (req: Request, res: Response) => {
        try {
          const errors = validationResult(req);

          if (!errors.isEmpty()) {
            throw new HttpError(`${errors.array()[0].msg}`, 400);
          }

          const { name, parent }: ICreateDirectoryDto = req.body;
          const email = req.user.email;
          const candidate = await this.userService.checkEmail(email);

          if (!candidate)
            throw new HttpError(
              'User not have permission to access this file',
              403,
            );

          const file = await this.fileService.createDirectory(
            name,

            candidate._id,
            parent,
          );
          return res.send(file);
        } catch (e: unknown) {
          if (!(e instanceof HttpError)) return res.send(e);
          return res
            .status(e.status)
            .send({ message: e.message, status: e.status });
        }
      },
    );

    /**
     * @swagger
     * /files:
     *   post:
     *     summary: Create a new file
     *     tags: [Files]
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: The file to be uploaded
     *               parent:
     *                 type: string
     *                 description: The ID of the parent directory. If not provided, the new file will be created in the root directory.
     *             required:
     *               - file
     *     responses:
     *       200:
     *         description: A new file has been created.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/File'
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: validation error
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 401
     *                   error: Authorization token is required
     *       403:
     *         description: Forbidden
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 403
     *                   error: User not have permission to access this file
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     */
    this.router.post(
      this.path,
      extractUserEmail,
      uploadMiddlware,
      async (req: Request, res: Response) => {
        try {
          const reqFile: any = req.files?.file;
          const parent = req.fields?.parent as string;

          if (!reqFile)
            return res
              .status(400)
              .send({ message: 'File not passed', status: 400 });

          const email = req.user.email;
          const candidate = await this.userService.checkEmail(email);
          // https://www.youtube.com/watch?v=L7Yge5Ph0z4
          if (!candidate)
            throw new HttpError(
              'User not have permission to access this file',
              403,
            );

          const file = await this.fileService.create(
            reqFile,
            candidate._id,
            parent,
          );

          return res.send(file);
        } catch (e: unknown) {
          if (!(e instanceof HttpError)) return res.send(e);
          return res
            .status(e.status)
            .send({ message: e.message, status: e.status });
        }
      },
    );

    /**
     * @swagger
     *
     * /files/{id}/update:
     *   patch:
     *     summary: Update a file by ID.
     *     tags:
     *       - Files
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the file to update.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               parentId:
     *                 type: string
     *                 description: The ID of the parent directory to move the file to.
     *               name:
     *                 type: string
     *                 description: The new name for the file.
     *             required:
     *               - parentId
     *               - name
     *     responses:
     *       200:
     *         description: The updated file.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/File'
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: File id is required
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 401
     *                   error: Authorization token is required
     *       403:
     *         description: Forbidden
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 403
     *                   error: User not have permission to access this file
     *       404:
     *         description: The requested file could not be found.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 404
     *                   error: File not found
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     */
    this.router.patch(
      `${this.path}/:id/update`,
      extractUserEmail,
      updateFileValidation,
      async (req: Request, res: Response) => {
        try {
          const { parent, name }: ICreateDirectoryDto = req.body;
          const fileId = req.params.id;

          if (!fileId) throw new HttpError('File id is required', 400);

          if (!parent && !name)
            throw new HttpError('name or parent is required', 400);

          const email = req.user.email;
          const candidate = await this.userService.checkEmail(email);

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
          if (!(e instanceof HttpError)) return res.send(e);
          return res
            .status(e.status)
            .send({ message: e.message, status: e.status });
        }
      },
    );

    /**
     * @swagger
     * /files/{id}/delete:
     *   delete:
     *     summary: Delete a file by ID.
     *     tags: [Files]
     *     parameters:
     *       - in: path
     *         name: id
     *         description: ID of the file to delete.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: The file has been deleted successfully.
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: File id is required
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 401
     *                   error: Authorization token is required
     *       403:
     *         description: Forbidden
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 403
     *                   error: User not have permission to access this file
     *       404:
     *         description: The requested file could not be found.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 404
     *                   error: File not found
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     */
    this.router.delete(
      `${this.path}/:id/delete`,
      extractUserEmail,
      async (req: Request, res: Response) => {
        try {
          const id = req.params?.id;

          if (!id) throw new HttpError('File id is required', 400);

          const email = req.user.email;
          const candidate = await this.userService.checkEmail(email);

          if (!candidate)
            throw new HttpError(
              'User not have permission to access this file',
              403,
            );

          const file = await this.fileService.delete(id, candidate._id);

          return res.status(204).send('');
        } catch (e) {
          if (!(e instanceof HttpError)) return res.send(e);
          return res
            .status(e.status)
            .send({ message: e.message, status: e.status });
        }
      },
    );
  }
}

export default FileController;
