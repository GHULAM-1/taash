// src/types/game.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types }             from 'mongoose';

@Schema({ timestamps: true })
export class Game extends Document {
  @Prop({ required: true, unique: true })
  roomId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner!: Types.ObjectId;
}

export const GameSchema = SchemaFactory.createForClass(Game);
export type GameDocument = Game & Document;
