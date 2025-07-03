#!/usr/bin/env node

import { cli, print, fileSystem } from './utils.js';
import { DirectoryComparator } from './comparator.js';
import { DirectorySynchronizer } from './synchronizer.js';

function main() {
  const args = cli.parseArgs();
  
  if (!args.command || args.command === 'help' || args.command === '--help' || args.command === '-h') {
    cli.showHelp();
    return;
  }

  switch (args.command) {
    case 'compare':
      handleCompare(args);
      break;
    case 'file-diff':
      handleFileDiff(args);
      break;
    case 'sync':
      handleSync(args);
      break;
    default:
      print.error(`❌ Unknown command: ${args.command}`);
      cli.showHelp();
      process.exit(1);
  }
}

function handleCompare(args) {
  if (args.arguments.length < 2) {
    print.error('❌ Two directory paths are required');
    print.gray('Usage: node src/index.js compare <dir1> <dir2>');
    process.exit(1);
  }

  const [dir1, dir2] = args.arguments;
  
  try {
    print.info('🔍 Directory comparison started...\n');
    
    const comparator = new DirectoryComparator();
    const result = comparator.compare(dir1, dir2);
    
    // Sonuçları raporla
    print.bold('📊 COMPARISON RESULTS\n');
    
    if (result.matching.length > 0) {
      print.success(`✅ Matching files (${result.matching.length}):`);
      result.matching.forEach(file => {
        print.gray(`   ${file}`);
      });
      console.log();
    }
    
    if (result.missing.length > 0) {
      print.error(`❌ Missing files (${result.missing.length}):`);
      result.missing.forEach(file => {
        print.gray(`   ${file}`);
      });
      console.log();
    }
    
    if (result.extra.length > 0) {
      print.warning(`➕ Extra files (${result.extra.length}):`);
      result.extra.forEach(file => {
        print.gray(`   ${file}`);
      });
      console.log();
    }
    
    if (result.changed.length > 0) {
      print.warning(`🔄 Changed files (${result.changed.length}):`);
      result.changed.forEach(file => {
        print.gray(`   ${file}`);
      });
      console.log();
    }
    
    // Özet
    print.bold('📈 SUMMARY:');
    console.log(`   Total files: ${result.matching.length + result.missing.length + result.extra.length + result.changed.length}`);
    console.log(`   Matching: ${result.matching.length}`);
    console.log(`   Missing: ${result.missing.length}`);
    console.log(`   Extra: ${result.extra.length}`);
    console.log(`   Changed: ${result.changed.length}`);
    
    // Senkronizasyon seçeneği
    if (args.options.sync || args.options.s) {
      print.info('\n🔄 Synchronization started...');
      
      const synchronizer = new DirectorySynchronizer();
      const syncResult = synchronizer.sync(dir1, dir2, result);
      
      print.success('\n✅ Synchronization completed!');
      console.log(`   Copied files: ${syncResult.copied.length}`);
      console.log(`   Updated files: ${syncResult.updated.length}`);
    }
    
  } catch (error) {
    print.error('❌ Error: ' + error.message);
    process.exit(1);
  }
}

function handleFileDiff(args) {
  if (args.arguments.length < 2) {
    print.error('❌ Two file paths are required');
    print.gray('Usage: node src/index.js file-diff <file1> <file2>');
    process.exit(1);
  }

  const [file1, file2] = args.arguments;
  
  try {
    const output = [];
    
    output.push('🔍 File comparison started...\n');
    
    const comparator = new DirectoryComparator();
    const result = comparator.compareFiles(file1, file2);
    
    if (result.same) {
      output.push('✅ Files are identical.');
    } else {
      output.push('❌ Files are different!');
      output.push(`Reason: ${result.reason}`);
      
      // Detaylı farkları göster
      const diffResult = comparator.showFileDifferences(file1, file2);
      
      if (diffResult.hasDifferences) {
        output.push(`\n📝 Differences (${diffResult.differences.length} lines):`);
        output.push('─'.repeat(80));
        
        diffResult.differences.forEach(diff => {
          output.push(`Line ${diff.lineNumber}:`);
          output.push(`  - ${file1}: ${diff.file1}`);
          output.push(`  + ${file2}: ${diff.file2}`);
          output.push('─'.repeat(80));
        });
        
        output.push('\n📊 Summary:');
        output.push(`   ${file1}: ${diffResult.totalLines1} lines`);
        output.push(`   ${file2}: ${diffResult.totalLines2} lines`);
        output.push(`   Different lines: ${diffResult.differences.length}`);
      }
    }
    
    // Sonuçları göster veya dosyaya kaydet
    if (args.options.output || args.options.o) {
      const outputFile = args.options.output || args.options.o;
      try {
        fileSystem.writeFile(outputFile, output.join('\n'));
        print.success(`✅ Results saved to ${outputFile}.`);
      } catch (error) {
        print.error('❌ File write error: ' + error.message);
      }
    } else {
      // CLI'da göster
      print.info('🔍 File comparison started...\n');
      
      if (result.same) {
        print.success('✅ Files are identical.');
      } else {
        print.error('❌ Files are different!');
        console.log('Reason:', result.reason);
        
        const diffResult = comparator.showFileDifferences(file1, file2);
        
        if (diffResult.hasDifferences) {
          print.warning(`\n📝 Differences (${diffResult.differences.length} lines):`);
          print.gray('─'.repeat(80));
          
          diffResult.differences.forEach(diff => {
            print.cyan(`Line ${diff.lineNumber}:`);
            print.error(`  - ${file1}: ${diff.file1}`);
            print.success(`  + ${file2}: ${diff.file2}`);
            print.gray('─'.repeat(80));
          });
          
          print.info(`\n📊 Summary:`);
          console.log(`   ${file1}: ${diffResult.totalLines1} lines`);
          console.log(`   ${file2}: ${diffResult.totalLines2} lines`);
          console.log(`   Different lines: ${diffResult.differences.length}`);
        }
      }
    }
  } catch (error) {
    print.error('❌ Error: ' + error.message);
    process.exit(1);
  }
}

function handleSync(args) {
  if (args.arguments.length < 2) {
    print.error('❌ Source and target directories are required');
    print.gray('Usage: node src/index.js sync <source> <target>');
    process.exit(1);
  }

  const [sourceDir, targetDir] = args.arguments;
  
  try {
    print.info('🔄 Synchronization started...\n');
    
    const comparator = new DirectoryComparator();
    const result = comparator.compare(sourceDir, targetDir);
    
    const synchronizer = new DirectorySynchronizer();
    const syncResult = synchronizer.sync(sourceDir, targetDir, result);
    
    print.success('\n✅ Synchronization completed!');
    console.log(`   Copied files: ${syncResult.copied.length}`);
    console.log(`   Updated files: ${syncResult.updated.length}`);
    
  } catch (error) {
    print.error('❌ Error: ' + error.message);
    process.exit(1);
  }
}

// Programı başlat
main(); 