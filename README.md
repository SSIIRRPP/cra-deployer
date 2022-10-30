# CRA-Deployer

Simple NodeJS application to deploy a Create-React-App application to S3 Bucket, and create a CloudFront invalidation.

## Usage

Install it:

```bash

 npm install --save-dev git@github.com:SSIIRRPP/cra-deployer.git

```

Use it:

```json
	// package.json

	"scripts": {
		...
		"deploy": "npm run build && npx cra-deployer --s3Bucket=s3BucketName --cloudfrontDistribution=cloudfronId (rest of options)",
	}

```

You can use it from a .js file too:

```js
// deploy.js
import Deployer from "cra-deployer";

const deploy = () => {
  const deployer = new Deployer({
    s3Bucket: "s3BucketName",
    cloudfrontDistribution: "cloudfrontDistributionId",
    // ...rest of arguments
  });

  deployer.start();
};

deploy();
```

This would give you more readability on your package.json file:

```json
	// package.json

	"scripts": {
		...
		"deploy": "npm run build && node deploy.js",
	}

```

All options must be provided in `--paramName=value` format.
For `Array<string>` options, provide values with comma separated format:

```bash
	 --paramName=value1,value2,value3
```

## To Consider

You need to set AWS CLI with proper and valid credentials.
If you need to use some AWS CLI profile other than the default one, you can set a env variable before executing the script:

```json
	// package.json

	"scripts": {
		...
		"deploy": "AWS_PROFILE=profile_name npx cra-deployer --s3Bucket=s3BucketName --cloudfrontDistribution=cloudfronId (rest of options)",
	}

```

The AWS Permissions this credentials need are:

- S3:
  - ListBucket
  - DeleteObject
  - PutObject
- CloudFront
  - CreateInvalidation

## Options

| Option                  | Type     | Required | Description                                                                                                                                                           | Default                                                                           |
| ----------------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| s3Bucket                | string   | ✔️       | AWS S3 bucket to upload files to.                                                                                                                                     | `undefined`                                                                       |
| cloudfrontDistribution  | string   | ✔️       | Cloudfront id to make the invalidation after upload.                                                                                                                  | `undefined`                                                                       |
| region                  | string   | ✖️       | AWS S3 Region.                                                                                                                                                        | `eu-west-3`                                                                       |
| buildPath               | string   | ✖️       | wheter it uploads the files specified in the `uploadFiles` or not, even if the build files dind't change. This will override the `uploadFiles` defualt value          | `undefined`                                                                       |
| uploadAnyway            | boolean  | ✖️       | Wheter it uploads the files specified in the `uploadFiles` or not, even if the build files dind't change, or not. This will override the `uploadFiles` defualt value. | `false`                                                                           |
| uploadFiles             | string[] | ✖️       | Path to files to upload content from.                                                                                                                                 | `["index.html","asset-manifest.json","manifest.json","robots.txt","favicon.ico"]` |
| invalidateFiles         | string[] | ✖️       | Files path to invalidate. Default value will be included if `invalidateFilesOverride` is false.                                                                       | `["index.html"]`                                                                  |
| invalidateFilesOverride | boolean  | ✖️       | Removes default value from `invalidateFiles`                                                                                                                          | `false`                                                                           |
