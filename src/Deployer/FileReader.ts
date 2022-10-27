import * as fs from "node:fs";
import path from "path";

class FileReader {
  private buildPath: string;
  private folderContents: Set<string>;
  constructor(_buildPath?: string) {
    console.log("Checking build path...");
    const buildPath = this.getPath(_buildPath);
    const validPath = this.checkFolder(buildPath);
    if (validPath) {
      this.buildPath = buildPath;
    } else {
      throw new Error(`Invalid path: ${buildPath}`);
    }
    console.log("Valid Build Path");
    const folderContents = this.readFolderContentPaths();
    this.folderContents = new Set(folderContents);
  }

  private getPath(providedPath?: string): string {
    if (providedPath) {
      return providedPath;
    }
    const buildPath = path.resolve("");
    if (!buildPath) {
      throw new Error("No build path found");
    }

    const replacedPath = buildPath.split("/node_modules");

    return `${replacedPath[0]}/build`;
  }

  private checkFolder(path: string): boolean {
    try {
      fs.accessSync(path);
    } catch (e) {
      console.error("No access to build folder at: ", path);
      return false;
    }
    try {
      fs.readFileSync(`${path}/index.html`, { encoding: "utf8" });
    } catch (e) {
      console.error("No build folder found at: ", path);
      return false;
    }
    return true;
  }

  private readFolderContentPaths(path: string = ""): string[] {
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
        } else {
          return value;
        }
      })
      .flat();
  }

  public getLocalFiles() {
    return this.folderContents;
  }

  public getFile(path: string) {
    return fs.readFileSync(`${this.buildPath}/${path}`);
  }
}

export default FileReader;
