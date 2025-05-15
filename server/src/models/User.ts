import mongoose, { Document, Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '@/types/user'; 

const userSchema = new mongoose.Schema<IUser>(
  {
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String , select:false},
    provider:  { type: String, enum: ['email', 'google'], default: 'email' },
    verified:  { type: Boolean, default: false },
  },
  { timestamps: true }
);


const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;