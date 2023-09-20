import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = HydratedDocument<User>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc: HydratedDocument<User>, ret: User) {
      ret = { ...{ id: ret._id.toString() }, ...ret };
      delete ret._id;
      delete ret.passwordHash;
      return ret;
    },
  },
})
export class User {
  _id?: Types.ObjectId;

  @ApiProperty()
  id?: string;

  @ApiProperty()
  @Prop({ index: true, unique: true })
  email: string;

  @Prop()
  passwordHash: string;

  @ApiProperty({ required: false })
  @Prop()
  name?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
