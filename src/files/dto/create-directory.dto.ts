/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateDirectoryDto:
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
export interface ICreateDirectoryDto {
  name: string;
  parent?: string;
}
