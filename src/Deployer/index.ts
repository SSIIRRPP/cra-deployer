import {
  DeleteObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import _FileReader from './FileReader';
import { processResponse, processResponses } from './util';
import { DeployerConfig } from '../types';
import mime from 'mime-types';

const defaultUploadFiles = [
  'index.html',
  'asset-manifest.json',
  'manifest.json',
  'robots.txt',
  'favicon.ico',
];

const defaultRegion = 'eu-west-3';

const defaultInvalidateFiles = ['/index.html'];

class Deployer {
  private s3Client: S3Client;
  private s3Bucket: string;
  private cloudfrontClient: CloudFrontClient;
  private cloudfrontDistribution: string;
  private fileReader: _FileReader;
  private bucketContents: Set<string> = new Set();
  private filesToUpload: Set<string>;
  private filesToDelete: Set<string>;
  private filesToInvalidate: Set<string>;
  private filesToInvalidateOverride: boolean;
  private uploadAnyway: boolean;
  private uploadAnywayFilePaths: Set<string>;
  private invalidationId: string = `${Date.now()}`;

  constructor(config: DeployerConfig) {
    this.s3Bucket = config.s3Bucket;
    this.cloudfrontDistribution = config.cloudfrontDistribution;
    this.uploadAnyway = config.uploadAnyway;
    this.uploadAnywayFilePaths = new Set([
      ...(config.uploadFiles ?? []),
      ...(config.uploadAnyway ? [] : defaultUploadFiles),
    ]);
    this.filesToUpload = new Set();
    this.filesToDelete = new Set();
    this.filesToInvalidate = new Set(...(config.invalidateFiles || []));
    this.filesToInvalidateOverride = config.invalidateFilesOverride;
    this.s3Client = new S3Client({ region: config.region ?? defaultRegion });
    this.cloudfrontClient = new CloudFrontClient({
      region: config.region ?? defaultRegion,
    });
    this.fileReader = new _FileReader(config.buildPath);
  }

  async start() {
    await this.getBucketContents();
    const localFiles = this.fileReader.getLocalFiles();
    this.populateFileKeySets(
      this.bucketContents,
      localFiles,
      this.filesToDelete
    );
    this.populateFileKeySets(
      localFiles,
      this.bucketContents,
      this.filesToUpload
    );

    if (
      this.filesToDelete.size > 0 ||
      this.filesToUpload.size > 0 ||
      this.uploadAnyway
    ) {
      await this.updateBucketContent();
      console.log('Closing cra-deployer');
    } else {
      console.log('Bucket content is up to date.');
      console.log('Closing cra-deployer');
    }
  }

  private populateFileKeySets(
    set1: Set<string>,
    set2: Set<string>,
    setToPopulate: Set<string>
  ): void {
    set1.forEach((key) => {
      if (!set2.has(key)) {
        setToPopulate.add(key);
      }
    });
  }

  private getBucketContents() {
    const command = new ListObjectsCommand({ Bucket: this.s3Bucket });
    return this.s3Client
      .send(command)
      .then((res) => {
        if (res.Contents) {
          return res.Contents.forEach((item) => {
            if (item.Key) {
              this.bucketContents.add(item.Key);
            }
          });
        } else {
          return undefined;
        }
      })
      .catch((e) => {
        console.error(e);
        throw new Error(e);
      });
  }

  private async updateBucketContent() {
    try {
      const deleteResponse = await this.deleteContentsFromBucket();
      const uploadResponse = await this.uploadFilesToBucket();
      if (processResponses([...deleteResponse, ...uploadResponse])) {
        const invalidationResponse = await this.createCloudfrontInvalidation();
        if (processResponse(invalidationResponse)) {
          console.log('Invalidation succesfully created: ', {
            Id: invalidationResponse.Invalidation?.Id,
            Status: invalidationResponse.Invalidation?.Status,
            CreateTime: invalidationResponse.Invalidation?.CreateTime,
            CloudfrontId: this.cloudfrontDistribution,
          });
          console.log('Successfully deployed!');
        } else {
          console.error(
            'Error creating cloudfornt invalidation: ',
            invalidationResponse
          );
        }
      } else {
        console.error('Error updating s3 Bucket contents');
      }
    } catch (e) {
      console.error('Error updating app assets: ', e);
    }
  }

  private deleteContentsFromBucket() {
    this.uploadAnywayFilePaths.forEach((filePath) =>
      this.filesToDelete.add(filePath)
    );
    return Promise.all(
      Array.from(this.filesToDelete).map(async (filePath) => {
        console.log('Deleting File from s3 bucket: ' + filePath);
        const command = new DeleteObjectCommand({
          Bucket: this.s3Bucket,
          Key: filePath,
        });
        const res = await this.s3Client.send(command);
        console.log('File successfully deleted from s3 bucket: ' + filePath);
        return res;
      })
    ).catch((e) => {
      console.error('Error deleting old s3 Bucket assets: ', e);
      return [e];
    });
  }

  private uploadFilesToBucket() {
    this.uploadAnywayFilePaths.forEach((filePath) =>
      this.filesToUpload.add(filePath)
    );
    return Promise.all(
      Array.from(this.filesToUpload).map(async (filePath) => {
        console.log('Uploading File to s3 bucket: ' + filePath);
        const file = this.fileReader.getFile(filePath);
        const contentType = mime.lookup(filePath);
        const command = new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: filePath,
          Body: file,
          ContentType: typeof contentType === 'string' ? contentType : '',
        });
        const res = await this.s3Client.send(command);
        console.log('File successfully uploaded to s3 bucket: ' + filePath);
        return res;
      })
    ).catch((e) => {
      console.error('Error uploading assets to s3 Bucket: ', e);
      return [e];
    });
  }

  private createCloudfrontInvalidation() {
    if (!this.filesToInvalidateOverride) {
      defaultInvalidateFiles.forEach((fileKey) =>
        this.filesToInvalidate.add(fileKey)
      );
    }
    const command = new CreateInvalidationCommand({
      DistributionId: this.cloudfrontDistribution,
      InvalidationBatch: {
        Paths: {
          Quantity: this.filesToInvalidate.size,
          Items: Array.from(this.filesToInvalidate),
        },
        CallerReference: this.invalidationId,
      },
    });
    return this.cloudfrontClient.send(command);
  }
}

export default Deployer;
