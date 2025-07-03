import path from 'path';
import { fileSystem, hash } from './utils.js';

export class DirectoryComparator {
  constructor() {
    this.ignorePatterns = [
      '.git',
      'node_modules',
      '.DS_Store',
      'Thumbs.db',
      '*.tmp',
      '*.log'
    ];
  }

  /**
   * Compare two directories
   */
  compare(dir1, dir2) {
    this.validateDirectories(dir1, dir2);
    const files1 = this.scanDirectory(dir1);
    const files2 = this.scanDirectory(dir2);
    const result = {
      matching: [],
      missing: [],
      extra: [],
      changed: []
    };
    for (const file of files1) {
      const relativePath = path.relative(dir1, file);
      const targetPath = path.join(dir2, relativePath);
      if (!files2.includes(targetPath)) {
        result.missing.push(relativePath);
      } else {
        if (this.filesAreDifferent(file, targetPath)) {
          result.changed.push(relativePath);
        } else {
          result.matching.push(relativePath);
        }
      }
    }
    for (const file of files2) {
      const relativePath = path.relative(dir2, file);
      const sourcePath = path.join(dir1, relativePath);
      if (!files1.includes(sourcePath)) {
        result.extra.push(relativePath);
      }
    }
    return result;
  }

  /**
   * Validate directories
   */
  validateDirectories(dir1, dir2) {
    if (!fileSystem.exists(dir1)) {
      throw new Error(`Directory not found: ${dir1}`);
    }
    if (!fileSystem.exists(dir2)) {
      throw new Error(`Directory not found: ${dir2}`);
    }
    if (!fileSystem.isDirectory(dir1)) {
      throw new Error(`${dir1} is not a directory`);
    }
    if (!fileSystem.isDirectory(dir2)) {
      throw new Error(`${dir2} is not a directory`);
    }
  }

  /**
   * Recursively scan all files in a directory
   */
  scanDirectory(dirPath) {
    const files = [];
    const scan = (currentPath) => {
      const items = fileSystem.readDirectory(currentPath);
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        if (fileSystem.isDirectory(fullPath)) {
          if (!this.shouldIgnore(item)) {
            scan(fullPath);
          }
        } else if (fileSystem.isFile(fullPath)) {
          if (!this.shouldIgnore(item)) {
            files.push(fullPath);
          }
        }
      }
    };
    scan(dirPath);
    return files;
  }

  /**
   * Check if a file should be ignored
   */
  shouldIgnore(filename) {
    return this.ignorePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(filename);
      }
      return filename === pattern;
    });
  }

  /**
   * Check if two files are different
   */
  filesAreDifferent(file1, file2) {
    try {
      const stat1 = fileSystem.getStats(file1);
      const stat2 = fileSystem.getStats(file2);
      if (stat1.size !== stat2.size) {
        return true;
      }
      if (stat1.mtime.getTime() !== stat2.mtime.getTime()) {
        return this.compareFileContents(file1, file2);
      }
      return false;
    } catch (error) {
      return true;
    }
  }

  /**
   * Compare file contents
   */
  compareFileContents(file1, file2) {
    try {
      const hash1 = hash.fileMd5(file1);
      const hash2 = hash.fileMd5(file2);
      return hash1 !== hash2;
    } catch (error) {
      return true;
    }
  }

  /**
   * Compare two files
   */
  compareFiles(file1, file2) {
    try {
      const stat1 = fileSystem.getStats(file1);
      const stat2 = fileSystem.getStats(file2);
      if (!stat1.isFile() || !stat2.isFile()) {
        throw new Error('Both paths must be files.');
      }
      if (stat1.size !== stat2.size) {
        return { same: false, reason: 'Different sizes', details: { size1: stat1.size, size2: stat2.size } };
      }
      if (stat1.mtime.getTime() !== stat2.mtime.getTime()) {
        const diff = this.compareFileContents(file1, file2);
        if (diff) {
          return { same: false, reason: 'Content differs', details: { mtime1: stat1.mtime, mtime2: stat2.mtime } };
        }
      }
      const hash1 = hash.fileMd5(file1);
      const hash2 = hash.fileMd5(file2);
      if (hash1 !== hash2) {
        return { same: false, reason: 'Different hash', details: { hash1, hash2 } };
      }
      return { same: true, reason: 'Files are identical', details: { size: stat1.size, mtime1: stat1.mtime, mtime2: stat2.mtime, hash: hash1 } };
    } catch (error) {
      return { same: false, reason: 'Error', details: { error: error.message } };
    }
  }

  /**
   * Show line-by-line differences between two files
   */
  showFileDifferences(file1, file2) {
    try {
      const content1 = fileSystem.readFile(file1);
      const content2 = fileSystem.readFile(file2);
      const lines1 = content1.split('\n');
      const lines2 = content2.split('\n');
      const maxLines = Math.max(lines1.length, lines2.length);
      const differences = [];
      for (let i = 0; i < maxLines; i++) {
        const line1 = lines1[i] || '';
        const line2 = lines2[i] || '';
        if (line1 !== line2) {
          differences.push({
            lineNumber: i + 1,
            file1: line1,
            file2: line2
          });
        }
      }
      return {
        hasDifferences: differences.length > 0,
        differences: differences,
        totalLines1: lines1.length,
        totalLines2: lines2.length
      };
    } catch (error) {
      throw new Error(`File read error: ${error.message}`);
    }
  }
} 