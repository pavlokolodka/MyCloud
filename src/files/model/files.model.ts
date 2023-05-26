import { Schema, model } from 'mongoose';
import { IFile } from './files.interface';

/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           required: true
 *         name:
 *           type: string
 *           required: true
 *         storageId:
 *           type: string
 *         link:
 *           type: string
 *         size:
 *           type: number
 *           required: true
 *         type:
 *           type: string
 *           required: true
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The ID of the User who uploaded the file.
 *         parent:
 *           type: string
 *           format: uuid
 *           description: The ID of the Parent file.
 *         childs:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: An array of Child file IDs.
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date when the file was uploaded.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the file was last updated.
 */
const fileSchema = new Schema<IFile>(
  {
    name: {
      type: String,
      required: true,
    },
    storageId: {
      type: String,
    },
    link: {
      type: String,
    },
    size: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },
    childs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'File',
      },
    ],
  },
  { timestamps: true },
);

export const File = model<IFile>('File', fileSchema);
