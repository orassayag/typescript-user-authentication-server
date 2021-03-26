const mkdirRecursive = require('mkdir-recursive');
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { promisify } from 'util';

export class FileService {
  private readonly promisifiedStat = promisify(fs.stat);
  private readonly promisifiedReadFile = promisify(fs.readFile);
  private readonly promisifiedWriteFile = promisify(fs.writeFile);
  private readonly promisifiedTruncate = promisify(fs.truncate);
  private readonly promisifiedOpen = promisify(fs.open);
  private readonly promisifiedReaddir = promisify(fs.readdir);
  private readonly promisifiedUnlink = promisify(fs.unlink); // delete
  private readonly promisifiedClose = promisify(fs.close);
  private readonly promisifiedMkdir = promisify(fs.mkdir);

  async getStats(path) {
    let stats;
    try {
      stats = await this.promisifiedStat(path);
    } catch (e) {
    }
    return stats;
  }

  async isExist(path) {
    let result = false;
    try {
      await this.promisifiedStat(path);
      result = true;
    } catch (e) {
    }
    return result;
  }

  createFile(path) {
    return this.promisifiedOpen(path, 'w+');
  }

  createFolder(path) {
    return this.promisifiedMkdir(path); // , 'w+');
  }

  readFile(path, opts = 'utf8') {
    return this.promisifiedReadFile(path, opts);
  }

  async writeImage(path, data, opts = {}) {
    return this.writeFile(path, data, Object.assign({ encoding: 'binary' }, opts));
  }

  // For one-time write better to use createAndCloseFile b/c of open descriptors during a long process.
  async writeFile(path, data, opts: any = {}) {
    await this.writeToFile(path, data, opts);
  }

  async appendFile(path, data, opts: any = {}) {
    opts.isAppend = true;
    await this.writeToFile(path, data, opts);
  }

  private async writeToFile(path, data, opts: any) {
    if (!opts.hasOwnProperty('isVerify') || opts.isVerify) {
      delete opts.isVerify;
      await this.verifyFile(path);
    }

    if (!opts.isAppend && os.platform() === 'win32') {
      try {
        await this.truncateFile(path);
      } catch (e) {
      }
    }

    const flag = (opts.isAppend ? 'a+' : 'r+');
    delete opts.isAppend;
    return this.promisifiedWriteFile(path, data, Object.assign({ mode: 0x777, flag }, opts));
  }

  async createAndCloseFile(path, data) {
    // Closing now b/c the os closes created files only on process exit, so many fds open until then.
    return new Promise(async (resolve, reject) => {
      let fd = 0;
      try {
        fd = await this.createFile(path);
        await this.promisifiedWriteFile(path, data, { mode: 0x777, flag: 'r+' });
        await this.promisifiedClose(fd);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  async appendFile2(path, data) {
    return this.promisifiedWriteFile(path, data, { mode: 0x777, flag: 'a+' });
  }

  truncateFile(path) {
    return this.promisifiedTruncate(path, 0);
  }

  // closeFile(fd) {
  // 	return this.promisifiedClose(fd);
  // }

  async verifyFolder(path) {
    return new Promise(async (resolve, reject) => {
      try {
        mkdirRecursive.mkdir(path, err => {
          if (err && err.code !== 'EEXIST') {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async verifyFile(path) {
    try {
      const isExist = await this.isExist(path);
      if (!isExist) {
        await this.createFile(path);
      }
    } catch (e) { }
  }

  // getFolderFileNames(path) {
  // 	return this.promisifiedReaddir(path);
  // }

  async getFolderFileDetails(folderPath) {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        const fileNames = await this.promisifiedReaddir(folderPath);
        const promises = await fileNames.map(async (fileName) => {
          const stat = await this.promisifiedStat(path.join(folderPath, fileName));
          /*
          if (fileName === 'shell32.dll') {
            console.log('stat:', stat);
            console.log('typeof atime:', typeof stat.atime, JSON.stringify(stat.atime, null, 2));
            const a = stat.atime;
            const b = Date.parse(stat.atime as any);
            console.log('typeof a:', typeof a);
            console.log('typeof b:', typeof b, b);
            // console.log('typeof a:', typeof a);
          }
          */

          // if (fileName === 'shell32.dll') console.log('instance of Date:', stat.mtime instanceof Date);
          // if (fileName === 'shell32.dll') console.log('instance of iso:', stat.mtime instanceof Iso);
          return { fileName, isFile: stat.isFile(), createdMs: stat.birthtimeMs, size: stat.size, mtime: stat.mtime };
        });
        const entries = await Promise.all(promises);
        resolve(entries);
      } catch (e) {
        reject(e);
      }
    });
  }

  async deleteFile(path) {
    const isExist = this.isExist(path);
    if (isExist) return this.promisifiedUnlink(path);
    return isExist;
  }
}

export const fileService = new FileService();