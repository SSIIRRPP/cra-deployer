"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs"));
const path_1 = __importDefault(require("path"));
class FileReader {
    constructor(_buildPath) {
        console.log("Checking build path...");
        const buildPath = this.getPath(_buildPath);
        const validPath = this.checkFolder(buildPath);
        if (validPath) {
            this.buildPath = buildPath;
        }
        else {
            throw new Error(`Invalid path: ${buildPath}`);
        }
        console.log("Valid Build Path");
        const folderContents = this.readFolderContentPaths();
        this.folderContents = new Set(folderContents);
    }
    getPath(providedPath) {
        if (providedPath) {
            return providedPath;
        }
        const buildPath = path_1.default.resolve("");
        if (!buildPath) {
            throw new Error("No build path found");
        }
        const replacedPath = buildPath.split("/node_modules");
        return `${replacedPath[0]}/build`;
    }
    checkFolder(path) {
        try {
            fs.accessSync(path);
        }
        catch (e) {
            console.error("No access to build folder at: ", path);
            return false;
        }
        try {
            fs.readFileSync(`${path}/index.html`, { encoding: "utf8" });
        }
        catch (e) {
            console.error("No build folder found at: ", path);
            return false;
        }
        return true;
    }
    readFolderContentPaths(path = "") {
        const readPath = `${this.buildPath}/${path}`;
        const folderContents = fs.readdirSync(readPath, {
            encoding: "utf-8",
            withFileTypes: true,
        });
        return folderContents
            .map((file) => {
            const value = `${Boolean(path) ? `${path}/` : ""}${file.name}`;
            if (file.isDirectory()) {
                return this.readFolderContentPaths(value);
            }
            else {
                return value;
            }
        })
            .flat();
    }
    getLocalFiles() {
        return this.folderContents;
    }
    getFile(path) {
        return fs.readFileSync(`${this.buildPath}/${path}`);
    }
}
exports.default = FileReader;
