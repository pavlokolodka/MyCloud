import mongoose from 'mongoose';
import { HttpError } from '../../utils/Error';
import { IFileRepository } from './files.repository-interface';
import { IFile } from './files.interface';
import { File } from './files.model';

export class FileRepository implements IFileRepository<IFile> {
  constructor(private database = File) {}

  public async create(query: IFile) {
    try {
      return await this.database.create(query);
    } catch (e) {
      throw new HttpError('creation error', 500);
    }
  }

  public async getAll(query: object = {}, sortBy: string) {
    try {
      let files;
      switch (sortBy) {
        case 'name':
          files = await this.database.find(query).sort({ name: 1 });
          break;
        case 'type':
          files = await this.database.find(query).sort({ type: 1 });
          break;
        case 'date':
          files = await this.database.find(query).sort({ date: 1 });
          break;
        default:
          files = await this.database.find(query);
          break;
      }
      return files;
    } catch (e) {
      throw new HttpError('can not get files', 500);
    }
  }

  public async getOne(query: object, userId: mongoose.Types.ObjectId) {
    try {
      const file = await this.database
        .findOne(query)
        .where('userId')
        .equals(userId);
      return file;
    } catch (e) {
      throw new HttpError('can not get file', 500);
    }
  }

  public async update(query: IFile) {
    try {
      return await this.database.updateOne(query);
    } catch (e) {
      throw new HttpError('update error', 500);
    }
  }

  public async delete(query: object) {
    try {
      return await this.database.deleteOne(query);
    } catch (e) {
      throw new HttpError('deletion error', 500);
    }
  }

  public async deleteParent(query: object, action: object) {
    try {
      return await this.database.updateOne(query, action);
    } catch (e) {
      throw new HttpError('update error', 500);
    }
  }
}
