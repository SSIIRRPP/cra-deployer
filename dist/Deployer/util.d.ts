import { DeleteObjectCommandOutput, PutObjectCommandOutput } from "@aws-sdk/client-s3";
import { CreateInvalidationCommandOutput } from "@aws-sdk/client-cloudfront";
declare type ResponseTypes = PutObjectCommandOutput | DeleteObjectCommandOutput | CreateInvalidationCommandOutput;
export declare const processResponse: (r: ResponseTypes) => boolean;
export declare const processResponses: (array: ResponseTypes[]) => boolean;
export {};
