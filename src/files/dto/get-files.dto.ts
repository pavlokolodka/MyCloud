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
 *       description: Specifies the ID of the parent directory whose files are to be fetched. If not provided, the files from root directory will be fetched.
 */
export interface IGetFilesDto {
  sortBy: string;
  parent: string;
}
