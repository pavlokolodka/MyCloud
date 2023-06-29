import { Types } from 'mongoose';
import { CreateFileDto } from '../../../src/files/dto/create-file.dto';
import { IFile } from '../../../src/files/model/files.interface';
import { IFileRepository } from '../../../src/files/model/files.repository-interface';
import { fileMock, filesMock } from './files.mock';
import { deleteResultMock, updateResultMock } from '../../users/mock/user.mock';
import { UpdateFileDto } from '../../../src/files/dto/update-file.dto';
import { Sort } from '../../../src/files/types/files.sort';
import { DeleteFromParentDto } from '../../../src/files/dto/delete-parent.dto';

export default class MockFileRepository implements IFileRepository<IFile> {
  public addChilds(
    parentId: Types.ObjectId,
    directorySize: number,
    childIds: Types.ObjectId[],
  ) {
    return Promise.resolve(updateResultMock);
  }
  public saveNewChilds(
    parentId: Types.ObjectId,
    directorySize: number,
    childIds: Types.ObjectId[] | undefined,
  ) {
    return Promise.resolve(updateResultMock);
  }

  public saveFileLink(fileId: Types.ObjectId, newLink: string) {
    return Promise.resolve(updateResultMock);
  }

  public create(query: CreateFileDto) {
    const newFile: IFile = {
      _id: new Types.ObjectId('50958c9f0000000000000000'),
      name: query.name,
      size: query.size,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: query.type,
      userId: query.userId,
      parent: query.parent || null,
      link: query.link,
      storageId: query.storageId,
      childs: query.childs || undefined,
      chunks: query.chunks || undefined,
      isComposed: query.isComposed || false,
    };

    return Promise.resolve(newFile);
  }

  public getAll(query: object, sortBy?: Sort) {
    return Promise.resolve(filesMock);
  }

  public getOne(id: Types.ObjectId) {
    if (String(id) === String(fileMock._id)) {
      return Promise.resolve(fileMock);
    }

    return Promise.resolve(null);
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

  public deleteFileFromParent(query: DeleteFromParentDto) {
    return Promise.resolve(updateResultMock);
  }
}
