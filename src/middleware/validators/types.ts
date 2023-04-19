/**
 * @swagger
 * components:
 *   schemas:
 *     ILoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email address.
 *         password:
 *           type: string
 *           description: The user's password.
 *       required:
 *         - email
 *         - password
 */
export interface ILoginBody {
  email: string;
  password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     IRefreshTokensBody:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: The refresh token used to generate a new access token.
 *       required:
 *         - refreshToken
 */
export interface IRefreshTokensBody {
  refreshToken: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     IRegisterBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user.
 *           example: John Smith
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user.
 *           example: john.smith@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: The password of the user.
 *           example: password123
 */
export interface IRegisterBody {
  name: string;
  email: string;
  password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateDirectoryBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the new directory.
 *         parent:
 *           type: string
 *           description: The ID of the parent directory. If not provided, the new directory will be created in the root directory.
 *       required:
 *         - name
 */
export interface ICreateDirectoryBody {
  name: string;
  parent?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     IUpdateFileBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the new directory.
 *         parent:
 *           type: string
 *           description: The ID of the parent directory. If not provided, the new directory will be created in the root directory.
 *       required:
 *         - name
 */
export interface IUpdateFileBody {
  name: string;
  parent?: string;
}

/**
 * @swagger
 * components:
 *   parameters:
 *     sortByParam:
 *       in: query
 *       name: sortBy
 *       schema:
 *         type: string
 *         enum: [name, type, date]
 *       description: Specifies the sorting order of files. Possible values are name, type, date.
 *     parentParam:
 *       in: query
 *       name: parent
 *       schema:
 *         type: string
 *         example: 48748c09-402a-4252-a08a-1b75f6556acb
 *       description: Specifies the ID of the parent directory whose files are to be fetched. If not provided, the files from root directory will be fetched.
 */
export interface IGetFilesParams {
  sortBy: string;
  parent: string;
}
