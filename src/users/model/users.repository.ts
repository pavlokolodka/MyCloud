import { startSession } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUser, RegistrationType } from './users.interface';
import { User } from './users.model';
import { IUserRepository } from './users.repository-interface';
import { SocialAccount } from './social-account.model';
import { UpsertUserWithSocialAccountDto } from '../dto/upsert-user-google.dto';

export class UserRepository implements IUserRepository<IUser> {
  constructor(private database = User) {}

  public async create(query: CreateUserDto) {
    return await this.database.create(query);
  }

  public async getAll() {
    return await this.database.find();
  }

  public async getOne(id: string) {
    return await this.database.findOne({ _id: id });
  }

  public async upsertByProviderId(query: UpsertUserWithSocialAccountDto) {
    const session = await startSession();
    session.startTransaction();

    try {
      const socialAccount = await SocialAccount.findOneAndUpdate(
        { providerId: query.openId },
        { $set: { profileUrl: query.pictureUrl, provider: query.provider } },
        { new: true, upsert: true, session },
      ).populate('userId');

      let user = socialAccount.userId as unknown as IUser;

      if (!user) {
        const [newUser] = await this.database.create(
          [
            {
              name: query.name,
              email: query.email,
              isVerified: true,
              registrationMethod: RegistrationType.Social,
            },
          ],
          { session },
        );

        user = await newUser.save({ session });

        socialAccount.userId = user._id;
        await socialAccount.save({ session });
      } else {
        user.name = query.name;
        // @ts-expect-error: Undeclared save method
        await user.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return user;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  public async getByEmail(email: string) {
    return await this.database.findOne({ email: email });
  }

  public async update(id: string, payload: UpdateUserDto) {
    return await this.database.updateOne({ _id: id }, payload);
  }

  public async delete(query: object) {
    return await this.database.deleteOne(query);
  }

  public async verify(id: string) {
    return await this.database.updateOne({ _id: id }, { isVerified: true });
  }

  public async updatePassoword(id: string, password: string) {
    return await this.database.updateOne({ _id: id }, { password });
  }
}
