import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../types/user.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string): Promise<User> {
    const u = await this.userModel.findById(id).select('-password');
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password');
  }

  async create(data: Partial<User>): Promise<User> {
    return this.userModel.create(data);
  }

  async updatePassword(id: string, newPassword: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.password = newPassword
    await user.save();
  }

  async markVerified(id: string) {
    await this.userModel.findByIdAndUpdate(id, { verified: true });
  }
}
