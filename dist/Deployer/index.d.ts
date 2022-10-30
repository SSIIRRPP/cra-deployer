import { DeployerConfig } from '../types';
declare class Deployer {
    private s3Client;
    private s3Bucket;
    private cloudfrontClient;
    private cloudfrontDistribution;
    private fileReader;
    private bucketContents;
    private filesToUpload;
    private filesToDelete;
    private filesToInvalidate;
    private filesToInvalidateOverride;
    private uploadAnyway;
    private uploadAnywayFilePaths;
    private invalidationId;
    constructor(config: DeployerConfig);
    uploadAll(): Promise<void>;
    start(): Promise<void>;
    private populateFileKeySets;
    private getBucketContents;
    private updateBucketContent;
    private deleteContentsFromBucket;
    private uploadFilesToBucket;
    private createCloudfrontInvalidation;
}
export default Deployer;
