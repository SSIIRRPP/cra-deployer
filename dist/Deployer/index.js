"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const client_cloudfront_1 = require("@aws-sdk/client-cloudfront");
const FileReader_1 = __importDefault(require("./FileReader"));
const util_1 = require("./util");
const mime_types_1 = __importDefault(require("mime-types"));
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
    constructor(config) {
        var _a, _b, _c;
        this.bucketContents = new Set();
        this.invalidationId = `${Date.now()}`;
        this.s3Bucket = config.s3Bucket;
        this.cloudfrontDistribution = config.cloudfrontDistribution;
        this.uploadAnyway = config.uploadAnyway;
        this.uploadAnywayFilePaths = new Set([
            ...((_a = config.uploadFiles) !== null && _a !== void 0 ? _a : []),
            ...(config.uploadAnyway ? [] : defaultUploadFiles),
        ]);
        this.filesToUpload = new Set();
        this.filesToDelete = new Set();
        this.filesToInvalidate = new Set(...(config.invalidateFiles || []));
        this.filesToInvalidateOverride = config.invalidateFilesOverride;
        this.s3Client = new client_s3_1.S3Client({ region: (_b = config.region) !== null && _b !== void 0 ? _b : defaultRegion });
        this.cloudfrontClient = new client_cloudfront_1.CloudFrontClient({
            region: (_c = config.region) !== null && _c !== void 0 ? _c : defaultRegion,
        });
        this.fileReader = new FileReader_1.default(config.buildPath);
    }
    uploadAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const localFiles = this.fileReader.getLocalFiles();
            localFiles.forEach((k) => this.filesToUpload.add(k));
            const uploadResponse = yield this.uploadFilesToBucket();
            if ((0, util_1.processResponses)(uploadResponse)) {
                yield this.createCloudfrontInvalidation();
            }
            else {
                console.error('Error updating s3 Bucket contents');
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getBucketContents();
            const localFiles = this.fileReader.getLocalFiles();
            this.populateFileKeySets(this.bucketContents, localFiles, this.filesToDelete);
            this.populateFileKeySets(localFiles, this.bucketContents, this.filesToUpload);
            if (this.filesToDelete.size > 0 ||
                this.filesToUpload.size > 0 ||
                this.uploadAnyway) {
                yield this.updateBucketContent();
                console.log('Closing cra-deployer');
            }
            else {
                console.log('Bucket content is up to date.');
                console.log('Closing cra-deployer');
            }
        });
    }
    populateFileKeySets(set1, set2, setToPopulate) {
        set1.forEach((key) => {
            if (!set2.has(key)) {
                setToPopulate.add(key);
            }
        });
    }
    getBucketContents() {
        const command = new client_s3_1.ListObjectsCommand({ Bucket: this.s3Bucket });
        return this.s3Client
            .send(command)
            .then((res) => {
            if (res.Contents) {
                return res.Contents.forEach((item) => {
                    if (item.Key) {
                        this.bucketContents.add(item.Key);
                    }
                });
            }
            else {
                return undefined;
            }
        })
            .catch((e) => {
            console.error(e);
            throw new Error(e);
        });
    }
    updateBucketContent() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.uploadAnywayFilePaths.forEach((filePath) => this.filesToDelete.add(filePath));
                const deleteResponse = yield this.deleteContentsFromBucket();
                this.uploadAnywayFilePaths.forEach((filePath) => this.filesToUpload.add(filePath));
                const uploadResponse = yield this.uploadFilesToBucket();
                if ((0, util_1.processResponses)([...deleteResponse, ...uploadResponse])) {
                    yield this.createCloudfrontInvalidation();
                }
                else {
                    console.error('Error updating s3 Bucket contents');
                }
            }
            catch (e) {
                console.error('Error updating app assets: ', e);
            }
        });
    }
    deleteContentsFromBucket() {
        return Promise.all(Array.from(this.filesToDelete).map((filePath) => __awaiter(this, void 0, void 0, function* () {
            console.log('Deleting File from s3 bucket: ' + filePath);
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.s3Bucket,
                Key: filePath,
            });
            const res = yield this.s3Client.send(command);
            console.log('File successfully deleted from s3 bucket: ' + filePath);
            return res;
        }))).catch((e) => {
            console.error('Error deleting old s3 Bucket assets: ', e);
            return [e];
        });
    }
    uploadFilesToBucket() {
        return Promise.all(Array.from(this.filesToUpload).map((filePath) => __awaiter(this, void 0, void 0, function* () {
            console.log('Uploading File to s3 bucket: ' + filePath);
            const file = this.fileReader.getFile(filePath);
            const contentType = mime_types_1.default.lookup(filePath);
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.s3Bucket,
                Key: filePath,
                Body: file,
                ContentType: typeof contentType === 'string' ? contentType : '',
            });
            const res = yield this.s3Client.send(command);
            console.log('File successfully uploaded to s3 bucket: ' + filePath);
            return res;
        }))).catch((e) => {
            console.error('Error uploading assets to s3 Bucket: ', e);
            return [e];
        });
    }
    createCloudfrontInvalidation() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.filesToInvalidateOverride) {
                defaultInvalidateFiles.forEach((fileKey) => this.filesToInvalidate.add(fileKey));
            }
            const command = new client_cloudfront_1.CreateInvalidationCommand({
                DistributionId: this.cloudfrontDistribution,
                InvalidationBatch: {
                    Paths: {
                        Quantity: this.filesToInvalidate.size,
                        Items: Array.from(this.filesToInvalidate),
                    },
                    CallerReference: this.invalidationId,
                },
            });
            const invalidationResponse = yield this.cloudfrontClient.send(command);
            if ((0, util_1.processResponse)(invalidationResponse)) {
                console.log('Invalidation succesfully created: ', {
                    Id: (_a = invalidationResponse.Invalidation) === null || _a === void 0 ? void 0 : _a.Id,
                    Status: (_b = invalidationResponse.Invalidation) === null || _b === void 0 ? void 0 : _b.Status,
                    CreateTime: (_c = invalidationResponse.Invalidation) === null || _c === void 0 ? void 0 : _c.CreateTime,
                    CloudfrontId: this.cloudfrontDistribution,
                });
                console.log('Successfully deployed!');
            }
            else {
                console.error('Error creating cloudfornt invalidation: ', invalidationResponse);
            }
            return invalidationResponse;
        });
    }
}
exports.default = Deployer;
