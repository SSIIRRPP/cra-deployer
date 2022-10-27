import {
  DeleteObjectCommandOutput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { CreateInvalidationCommandOutput } from "@aws-sdk/client-cloudfront";
type ResponseTypes =
  | PutObjectCommandOutput
  | DeleteObjectCommandOutput
  | CreateInvalidationCommandOutput;

export const processResponse = (r: ResponseTypes): boolean =>
  r?.$metadata?.httpStatusCode?.toString().startsWith("2") ||
  r?.$metadata?.httpStatusCode === 304 ||
  false;

export const processResponses = (array: ResponseTypes[]): boolean =>
  array.every((r) => processResponse(r));
