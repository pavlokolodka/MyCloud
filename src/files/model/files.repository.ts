import mongoose, { Types } from 'mongoose';
import { IFileRepository } from './files.repository-interface';
import { IFile } from './files.interface';
import { File } from './files.model';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { Sort } from '../types/files.sort';
import { DeleteFromParentDto } from '../dto/delete-parent.dto';

export class FileRepository implements IFileRepository<IFile> {
  constructor(private database = File) {}

  public async create(query: CreateFileDto) {
    return await this.database.create(query);
  }

  public async getAll(query: object = {}, sortBy?: Sort) {
    let files;
    switch (sortBy) {
      case 'name':
        files = await this.database.find(query).sort({ name: 1 });
        break;
      case 'type':
        files = await this.database.find(query).sort({ type: 1 });
        break;
      case 'date':
        files = await this.database.find(query).sort({ createdAt: 1 });
        break;
      default:
        files = await this.database.find(query);
        break;
    }
    return files;
  }

  public async getOne(id: Types.ObjectId) {
    const file = await this.database.findOne({ _id: id });

    return file;
  }

  public async getOneWithUser(query: object, userId: mongoose.Types.ObjectId) {
    const file = await this.database
      .findOne(query)
      .where('userId')
      .equals(userId);

    return file;
  }

  public async update(query: UpdateFileDto) {
    const { fileId, ...data } = query;
    console.log('data', data);
    return await this.database.updateOne({ _id: fileId }, data);
  }

  public async delete(query: object) {
    return await this.database.deleteOne(query);
  }

  public async deleteFileFromParent(query: DeleteFromParentDto) {
    return await this.database.updateOne(
      { _id: query.parentId, userId: query.userId },
      { $pull: { childs: query.fileId } },
    );
  }

  public async addChilds(
    parentId: mongoose.Types.ObjectId,
    childIds: mongoose.Types.ObjectId[],
  ) {
    return this.database.updateOne(
      { _id: parentId },
      { $push: { childs: { $each: childIds } } },
    );
  }

  public async saveNewChilds(
    parentId: mongoose.Types.ObjectId,
    childIds: mongoose.Types.ObjectId[] | undefined,
  ) {
    return this.database.updateOne({ _id: parentId }, { childs: childIds });
  }

  public async saveFileLink(fileId: mongoose.Types.ObjectId, newLink: string) {
    const nowDate = new Date();
    return this.database.updateOne(
      { _id: fileId },
      { link: newLink, updatedAt: nowDate },
    );
  }
}
