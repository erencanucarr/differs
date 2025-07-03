# diffox

A lightweight, dependency-free Node.js CLI tool for comparing and synchronizing directories and files. Features include recursive directory scanning, file content comparison using MD5 hashing, line-by-line file diffing, and intelligent synchronization based on modification timestamps.

## ✨ Features

- **Directory Comparison**: Compare two directories recursively and identify differences
- **File Comparison**: Compare individual files with line-by-line diffing
- **Smart Synchronization**: Sync directories with timestamp-based conflict resolution
- **Zero Dependencies**: Uses only Node.js built-in modules
- **Colored Output**: Beautiful CLI output with color-coded results
- **File Export**: Save comparison results to text files
- **Backup Support**: Automatic backup creation before file modifications

## 🚀 Installation

```bash
npm install -g diffox
```

Or use directly without installation:
```bash
npx diffox
```

## 📖 Usage

### Compare Directories

```bash
# Basic directory comparison
diffox compare ./folder1 ./folder2

# Compare and synchronize
diffox compare ./folder1 ./folder2 --sync
```

### Compare Files

```bash
# Compare two files
diffox file-diff file1.txt file2.txt

# Save results to file
diffox file-diff file1.txt file2.txt -o differences.txt
```

### Synchronize Directories

```bash
# Synchronize source to target
diffox sync ./source ./target
```

## 📋 Commands

| Command | Description | Example |
|---------|-------------|---------|
| `compare` | Compare two directories | `diffox compare ./dir1 ./dir2` |
| `file-diff` | Compare two files | `diffox file-diff a.js b.js` |
| `sync` | Synchronize directories | `diffox sync ./src ./backup` |

## ⚙️ Options

| Option | Description | Example |
|--------|-------------|---------|
| `-s, --sync` | Synchronize after comparison | `diffox compare ./a ./b --sync` |
| `-o, --output` | Save results to file | `diffox file-diff a.js b.js -o diff.txt` |
| `-v, --verbose` | Verbose output | `diffox compare ./a ./b --verbose` |
| `-f, --force` | Force operation without confirmation | `diffox sync ./a ./b --force` |

## 📊 Output Examples

### Directory Comparison
```
🔍 Directory comparison started...

📊 COMPARISON RESULTS

✅ Matching files (3):
   file1.txt
   file2.txt
   subdir/file3.txt

❌ Missing files (2):
   file4.txt
   file5.txt

➕ Extra files (1):
   backup.txt

🔄 Changed files (1):
   config.json

📈 SUMMARY:
   Total files: 7
   Matching: 3
   Missing: 2
   Extra: 1
   Changed: 1
```

### File Comparison
```
🔍 File comparison started...

❌ Files are different!
Reason: Content differs

📝 Differences (2 lines):
────────────────────────────────────────────────────────────────────────────────
Line 3:
  - file1.js: const version = "1.0.0";
  + file2.js: const version = "2.0.0";
────────────────────────────────────────────────────────────────────────────────
Line 5:
  - file1.js: console.log("Hello World");
  + file2.js: console.log("Hello Universe");
────────────────────────────────────────────────────────────────────────────────

📊 Summary:
   file1.js: 6 lines
   file2.js: 6 lines
   Different lines: 2
```

## 🔧 How It Works

### Comparison Algorithm
1. **Recursive Scanning**: Scans directories recursively, ignoring common system files
2. **Hash Comparison**: Uses MD5 hashing for efficient content comparison
3. **Timestamp Analysis**: Compares modification times for change detection
4. **Line-by-line Diffing**: For files, shows exact line differences

### Synchronization Strategy
1. **Missing Files**: Copies files that exist in source but not in target
2. **Changed Files**: Updates files based on modification timestamps
3. **Backup Creation**: Creates `.backup` files before modifications
4. **Conflict Resolution**: Prefers newer files based on timestamps

## 🛠️ Development

### Prerequisites
- Node.js 16+ (for ES modules support)

### Local Development
```bash
# Clone the repository
git clone https://github.com/erencanucarr/diffox.git
cd diffox

# Run directly
node src/index.js compare ./test1 ./test2
```

### Project Structure
```
diffox/
├── src/
│   ├── index.js          # Main CLI entry point
│   ├── utils.js          # Utility functions
│   ├── comparator.js     # Directory/file comparison logic
│   └── synchronizer.js   # Synchronization logic
├── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Node.js built-in modules only
- Inspired by Unix `diff` and `rsync` tools
- Designed for simplicity and reliability

---

**Made with ❤️ for developers who love clean, dependency-free tools.** 