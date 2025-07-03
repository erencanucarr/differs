import path from 'path';
import { fileSystem, print } from './utils.js';

export class DirectorySynchronizer {
  constructor() {
    this.backupEnabled = true;
    this.backupSuffix = '.backup';
  }

  /**
   * Synchronize two directories
   */
  async sync(sourceDir, targetDir, comparisonResult) {
    const result = {
      copied: [],      // Kopyalanan dosyalar
      updated: [],     // Güncellenen dosyalar
      errors: []       // Hatalar
    };

    try {
      // Eksik dosyaları kopyala
      for (const missingFile of comparisonResult.missing) {
        this.copyFile(sourceDir, targetDir, missingFile, result);
      }

      // Değişen dosyaları güncelle (zaman damgasına göre)
      for (const changedFile of comparisonResult.changed) {
        this.updateFile(sourceDir, targetDir, changedFile, result);
      }

      return result;
    } catch (error) {
      result.errors.push(error.message);
      throw error;
    }
  }

  /**
   * Copy file from source to target
   */
  copyFile(sourceDir, targetDir, relativePath, result) {
    try {
      const sourcePath = path.join(sourceDir, relativePath);
      const targetPath = path.join(targetDir, relativePath);

      // Hedef dizinin varlığını kontrol et ve gerekirse oluştur
      const targetDirPath = path.dirname(targetPath);
      fileSystem.createDirectory(targetDirPath);

      // Dosyayı kopyala
      fileSystem.copyFile(sourcePath, targetPath);

      result.copied.push(relativePath);
      print.success(`   ✅ Copied: ${relativePath}`);
    } catch (error) {
      result.errors.push(`Copy error (${relativePath}): ${error.message}`);
      print.error(`   ❌ Error: ${relativePath} - ${error.message}`);
    }
  }

  /**
   * Update file by modification time
   */
  updateFile(sourceDir, targetDir, relativePath, result) {
    try {
      const sourcePath = path.join(sourceDir, relativePath);
      const targetPath = path.join(targetDir, relativePath);

      // Her iki dosyanın zaman damgasını kontrol et
      const sourceStat = fileSystem.getStats(sourcePath);
      const targetStat = fileSystem.getStats(targetPath);

      // Kaynak dosya daha yeniyse güncelle
      if (sourceStat.mtime.getTime() > targetStat.mtime.getTime()) {
        // Yedek oluştur
        if (this.backupEnabled) {
          this.createBackup(targetPath);
        }

        // Dosyayı güncelle
        fileSystem.copyFile(sourcePath, targetPath);

        result.updated.push(relativePath);
        print.warning(`   🔄 Updated: ${relativePath}`);
      } else {
        print.info(`   ⏭️  Skipped (target is newer): ${relativePath}`);
      }
    } catch (error) {
      result.errors.push(`Update error (${relativePath}): ${error.message}`);
      print.error(`   ❌ Error: ${relativePath} - ${error.message}`);
    }
  }

  /**
   * Create backup for a file
   */
  createBackup(filePath) {
    try {
      const backupPath = filePath + this.backupSuffix;
      fileSystem.copyFile(filePath, backupPath);
    } catch (error) {
      print.warning(`   ⚠️  Could not create backup: ${filePath}`);
    }
  }

  /**
   * Clean up backup files
   */
  cleanupBackups(targetDir) {
    try {
      const files = this.getAllFiles(targetDir);
      
      for (const file of files) {
        if (file.endsWith(this.backupSuffix)) {
          fileSystem.deleteFile(file);
          print.gray(`   🗑️  Backup deleted: ${path.relative(targetDir, file)}`);
        }
      }
    } catch (error) {
      print.warning(`   ⚠️  Backup cleanup error: ${error.message}`);
    }
  }

  /**
   * Recursively list all files in a directory
   */
  getAllFiles(dirPath) {
    const files = [];
    
    const scan = (currentPath) => {
      const items = fileSystem.readDirectory(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        
        if (fileSystem.isDirectory(fullPath)) {
          scan(fullPath);
        } else if (fileSystem.isFile(fullPath)) {
          files.push(fullPath);
        }
      }
    };
    
    scan(dirPath);
    return files;
  }

  /**
   * Ask for confirmation before sync (not interactive)
   */
  async requestConfirmation(comparisonResult) {
    const totalChanges = comparisonResult.missing.length + comparisonResult.changed.length;
    
    if (totalChanges === 0) {
      print.info('   ℹ️  No files to synchronize.');
      return false;
    }

    print.warning(`\n⚠️  ${totalChanges} files will be synchronized:`);
    
    if (comparisonResult.missing.length > 0) {
      print.cyan(`   To be copied: ${comparisonResult.missing.length} files`);
    }
    
    if (comparisonResult.changed.length > 0) {
      print.cyan(`   To be updated: ${comparisonResult.changed.length} files`);
    }

    // Gerçek uygulamada burada kullanıcıdan onay alınabilir
    // Şimdilik otomatik olarak devam ediyoruz
    return true;
  }
} 