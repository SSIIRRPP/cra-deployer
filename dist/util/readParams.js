"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readParams = void 0;
const readParams = () => {
    console.log(process.argv);
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
    };
};
exports.readParams = readParams;
