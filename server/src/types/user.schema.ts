import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types }             from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ enum: ["email", "google"], default: "email" })
  provider!: "email" | "google";

  @Prop({ default: false })
  verified!: boolean;
}
export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
