import { Router } from 'express';
import { extractUserId } from '../middleware/auth';
import FileController from './files.controller';
import { updateFileValidation } from '../middleware/validators/validator';
import { uploadLargeFileMiddlware } from '../middleware/uploadLargeFile';

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: API for managing files
 */
class FileRouter {
  private path = '/files';
  private fileController: FileController;
  public router = Router();

  constructor(fileController: FileController) {
    this.fileController = fileController;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /files/download:
     *   get:
     *     tags: [Files]
     *     summary: Download a file
     *     security:
     *       - bearerAuth: []
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
      extractUserId,
      this.fileController.download,
    );

    /**
     * @swagger
     * /files/download-large:
     *   get:
     *     tags: [Files]
     *     summary: Download a large file
     *     security:
     *       - bearerAuth: []
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
      `${this.path}/download-large`,
      extractUserId,
      this.fileController.downloadLarge,
    );

    /**
     * @swagger
     * /files:
     *   get:
     *     summary: Get all files (directories)
     *     tags: [Files]
     *     security:
     *       - bearerAuth: []
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
    this.router.get(this.path, extractUserId, this.fileController.getAll);

    /**
     * @swagger
     * /files/{id}:
     *   get:
     *     summary: Get a file (directory) by ID
     *     tags: [Files]
     *     security:
     *       - bearerAuth: []
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
      extractUserId,
      this.fileController.getOne,
    );

    /**
     * @swagger
     * /files:
     *   post:
     *     summary: Create a new file (directory)
     *     tags: [Files]
     *     security:
     *       - bearerAuth: []
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
     *                 example: 48748c09-402a-4252-a08a-1b75f6556acb
     *                 description: The ID of the parent directory. If not provided, the new file will be created in the root directory.
     *               type:
     *                 type: string
     *                 enum: [directory]
     *                 description: If provided, the new directory will be created. This parameter also requires the name parameter
     *               name:
     *                 type: string
     *                 example: directory name
     *                 description: The name of the new directory
     *     responses:
     *       200:
     *         description: A new file/directory has been created.
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
      `${this.path}/large`,
      extractUserId,
      uploadLargeFileMiddlware,
      this.fileController.create,
    );

    /**
     * @swagger
     *
     * /files/{id}:
     *   patch:
     *     summary: Update a file (directory) by ID.
     *     tags: [Files]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the file to update.
     *     requestBody:
     *       required: true
     *       description: The request body for updating the file type of IUpdateFileBody.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IUpdateFileBody'
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
     *       409:
     *         description: The requested file is already in the directory.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 409
     *                   error: Unable to add an existing file to the directory
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     */
    this.router.patch(
      `${this.path}/:id`,
      extractUserId,
      updateFileValidation,
      this.fileController.update,
    );

    /**
     * @swagger
     * /files/{id}:
     *   delete:
     *     summary: Delete a file (directory) by ID.
     *     tags: [Files]
     *     security:
     *       - bearerAuth: []
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
      `${this.path}/:id`,
      extractUserId,
      this.fileController.delete,
    );
  }
}

export default FileRouter;
