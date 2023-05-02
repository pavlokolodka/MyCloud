import { Types } from 'mongoose';
import { CreateFileDto } from '../../../src/files/dto/create-file.dto';
import { IFile } from '../../../src/files/model/files.interface';
import { IFileRepository } from '../../../src/files/model/files.repository-interface';
import { fileMock } from './files.mock';
import { deleteResultMock, updateResultMock } from '../../users/mock/user.mock';
import { UpdateFileDto } from '../../../src/files/dto/update-file.dto';
import { UpdateResult } from 'mongodb';

export default class MockFileRepository implements IFileRepository<IFile> {
  addChilds: (
    parentId: Types.ObjectId,
    childIds: Types.ObjectId[],
  ) => Promise<UpdateResult>;
  saveNewChilds: (
    parentId: Types.ObjectId,
    childIds: Types.ObjectId[] | undefined,
  ) => Promise<UpdateResult>;
  saveFileLink: (
    fileId: Types.ObjectId,
    newLink: string,
  ) => Promise<UpdateResult>;
  public create(query: CreateFileDto) {
    const newFile: IFile = {
      _id: new Types.ObjectId('50958c9f0000000000000000'),
      name: query.name,
      size: query.size,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: query.type,
      userId: query.userId,
      parent: query.parent,
      link: query.link,
      storageId: query.storageId,
      childs: query.childs || undefined,
    };

    return Promise.resolve(newFile);
  }

  public getAll(query: object, sortBy: string) {
    return Promise.resolve([fileMock]);
  }

  public getOne(query: object) {
    return Promise.resolve(fileMock);
  }

  public getOneWithUser(query: object, userId: Types.ObjectId) {
    return Promise.resolve(fileMock);
  }

  public update(query: UpdateFileDto) {
    return Promise.resolve(updateResultMock);
  }

  public delete(query: object) {
    return Promise.resolve(deleteResultMock);
  }

  public deleteParent(query: object, action: object) {
    return Promise.resolve(updateResultMock);
  }
}
