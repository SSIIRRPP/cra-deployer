export interface DeployerConfig {
  s3Bucket: string;
  cloudfrontDistribution: string;
  region?: string;
  buildPath?: string;
  uploadAnyway: boolean;
  uploadFiles?: string[];
  invalidateFiles?: string[];
  invalidateFilesOverride: boolean;
}
