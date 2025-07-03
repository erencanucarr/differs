import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Color codes
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Colored print functions
export const print = {
  success: (text) => console.log(`${colors.green}${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}${text}${colors.reset}`),
  info: (text) => console.log(`${colors.blue}${text}${colors.reset}`),
  gray: (text) => console.log(`${colors.gray}${text}${colors.reset}`),
  bold: (text) => console.log(`${colors.bright}${text}${colors.reset}`),
  cyan: (text) => console.log(`${colors.cyan}${text}${colors.reset}`),
  magenta: (text) => console.log(`${colors.magenta}${text}${colors.reset}`)
};

// File system utilities
export const fileSystem = {
  // Dosya veya dizin var mı kontrol et
  exists: (path) => {
    try {
      return fs.existsSync(path);
    } catch {
      return false;
    }
  },

  // Dosya mı kontrol et
  isFile: (path) => {
    try {
      return fs.statSync(path).isFile();
    } catch {
      return false;
    }
  },

  // Dizin mi kontrol et
  isDirectory: (path) => {
    try {
      return fs.statSync(path).isDirectory();
    } catch {
      return false;
    }
  },

  // Dosya istatistiklerini al
  getStats: (path) => {
    try {
      return fs.statSync(path);
    } catch (error) {
      throw new Error(`Could not get file stats: ${error.message}`);
    }
  },

  // Dosya oku
  readFile: (path, encoding = 'utf8') => {
    try {
      return fs.readFileSync(path, encoding);
    } catch (error) {
      throw new Error(`Could not read file: ${error.message}`);
    }
  },

  // Dosya yaz
  writeFile: (path, content, encoding = 'utf8') => {
    try {
      fs.writeFileSync(path, content, encoding);
    } catch (error) {
      throw new Error(`Could not write file: ${error.message}`);
    }
  },

  // Dizin oluştur
  createDirectory: (dirPath) => {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (error) {
      throw new Error(`Could not create directory: ${error.message}`);
    }
  },

  // Dosya kopyala
  copyFile: (source, target) => {
    try {
      const targetDir = path.dirname(target);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.copyFileSync(source, target);
    } catch (error) {
      throw new Error(`Could not copy file: ${error.message}`);
    }
  },

  // Dizindeki dosyaları listele
  readDirectory: (dirPath) => {
    try {
      return fs.readdirSync(dirPath);
    } catch (error) {
      throw new Error(`Could not read directory: ${error.message}`);
    }
  },

  // Dosya sil
  deleteFile: (filePath) => {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      throw new Error(`Could not delete file: ${error.message}`);
    }
  }
};

// Hash hesaplama
export const hash = {
  // MD5 hash hesapla
  md5: (data) => {
    return crypto.createHash('md5').update(data).digest('hex');
  },

  // Dosya MD5 hash'i hesapla
  fileMd5: (filePath) => {
    try {
      const content = fileSystem.readFile(filePath, 'binary');
      return hash.md5(content);
    } catch (error) {
      throw new Error(`Could not calculate hash: ${error.message}`);
    }
  }
};

// CLI argüman işleme
export const cli = {
  // Argümanları parse et
  parseArgs: () => {
    const args = process.argv.slice(2);
    const parsed = {
      command: args[0],
      arguments: [],
      options: {}
    };

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        parsed.options[key] = value || true;
      } else if (arg.startsWith('-')) {
        const key = arg.slice(1);
        const nextArg = args[i + 1];
        if (nextArg && !nextArg.startsWith('-')) {
          parsed.options[key] = nextArg;
          i++; // Sonraki argümanı atla
        } else {
          parsed.options[key] = true;
        }
      } else {
        parsed.arguments.push(arg);
      }
    }

    return parsed;
  },

  // Yardım mesajı göster
  showHelp: () => {
    print.info('📁 diffox - Directory Comparison and Synchronization Tool\n');
    print.info('Usage:');
    print.gray('  node src/index.js <command> [arguments] [options]\n');
    print.info('Commands:');
    print.gray('  compare <dir1> <dir2>         Compare two directories');
    print.gray('  file-diff <file1> <file2>     Compare two files');
    print.gray('  sync <source> <target>        Synchronize directories\n');
    print.info('Options:');
    print.gray('  -s, --sync                    Synchronize after comparison');
    print.gray('  -o, --output <file>           Save results to file');
    print.gray('  -v, --verbose                 Verbose output');
    print.gray('  -f, --force                   Force operation without confirmation\n');
    print.info('Examples:');
    print.gray('  node src/index.js compare ./folder1 ./folder2');
    print.gray('  node src/index.js file-diff a.js b.js -o result.txt');
    print.gray('  node src/index.js sync ./source ./target');
  }
}; 