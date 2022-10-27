/// <reference types="node" />
declare class FileReader {
    private buildPath;
    private folderContents;
    constructor(_buildPath?: string);
    private getPath;
    private checkFolder;
    private readFolderContentPaths;
    getLocalFiles(): Set<string>;
    getFile(path: string): Buffer;
}
export default FileReader;
