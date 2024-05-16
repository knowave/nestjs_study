import { Field, InputType } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import * as Upload from 'graphql-upload/Upload.js';

@InputType()
export class UploadInput {
  @Field(() => GraphQLUpload, {
    nullable: true,
    description: 'Images file',
  })
  imageFile: Upload;
}
