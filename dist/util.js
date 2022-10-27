"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readParams = void 0;
const readParams = () => {
    const getParam = (name) => {
        const param = process.argv.find((s) => s.startsWith(`--${name}`));
        if (param) {
            return param.replace(`--${name}=`, "");
        }
    };
    const s3Bucket = getParam("s3Bucket");
    const cloudfrontDistribution = getParam("cloudfrontDistribution");
    const region = getParam("region");
    const buildPath = getParam("buildPath");
    const uploadFiles = getParam("uploadFiles");
    const uploadAnyway = getParam("uploadAnyway");
    const invalidateFiles = getParam("invalidateFiles");
    const invalidateFilesOverride = getParam("invalidateFilesOverride");
    if (!s3Bucket) {
        throw new Error("no s3 bucket provided");
    }
    if (!cloudfrontDistribution) {
        throw new Error("no cloudfront distribution provided");
    }
    return {
        s3Bucket,
        cloudfrontDistribution,
        region: region ? region : undefined,
        buildPath: buildPath ? buildPath : undefined,
        uploadFiles: uploadFiles ? uploadFiles.split(",") : undefined,
        uploadAnyway: uploadAnyway ? true : false,
        invalidateFiles: invalidateFiles ? invalidateFiles.split(",") : undefined,
        invalidateFilesOverride: invalidateFilesOverride ? true : false,
    };
};
exports.readParams = readParams;
