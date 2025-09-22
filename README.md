# Smart Suggestion Extension

![VS Code Extension](https://img.shields.io/badge/VS%2520Code-Extension-brightgreen)
![Version](https://img.shields.io/badge/version-0.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A **VS Code extension** that provides intelligent code suggestions through a sidebar panel with **@-triggered contextual suggestions** and **advanced search capabilities**.

---

## ✨ Features

- 🚀 **Intelligent Sidebar Panel**: Code suggestion interface in VS Code sidebar  
- **@ Context-Aware Suggestions**: Type `@` in your code to trigger relevant suggestions  
- 🔍 **Advanced Search**: Natural language processing and fuzzy search algorithms  
- 📁 **File-Based System**: Loads suggestions from JSON configuration files  
- 📋 **One-Click Insertion**: Click to insert code snippets at cursor position  
- 🎨 **Theme-Aware UI**: Beautiful interface that matches VS Code theme  
- 💾 **Session Caching**: Intelligent caching for better performance  

---

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** (v14 or higher) – [Download here](https://nodejs.org/)  
- **npm** (comes with Node.js)  
- **Git** – [Download here](https://git-scm.com/downloads)  
- **Visual Studio Code** – [Download here](https://code.visualstudio.com/)  

---

## ⚙️ Installation & Setup

### 1. Install Node.js and npm
```bash
# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version

# If not installed, download from https://nodejs.org/
```

### 2. Clone or Initialize Repository  
**Option A: Clone existing repository**
```bash
git clone https://github.com/Gnaneshwar-ux/nms-smart-ext.git
cd nms-smart-ext
```

**Option B: Initialize new repository**
```bash
# Create project directory
mkdir nms-smart-ext
cd nms-smart-ext

# Initialize Git repository
git init

# Add remote origin (replace with your username)
git remote add origin https://github.com/your-username/nms-smart-ext.git
```

### 3. Install Dependencies
```bash
# Install npm dependencies
npm install

# This will install:
# - natural: NLP library for intelligent search
# - vscode: VS Code extension API
```

---

## 🗂 Project Structure
```
nms-smart-ext/
├── .vscode/                 # VS Code configuration
│   └── launch.json          # Debug configuration
├── resources/               # Resource files
│   └── nms_sources/         # Suggestion data files
│       ├── jbot_commands.json
│       └── code_snippets.json
├── .gitignore               # Git ignore rules
├── extension.js             # Main extension file
├── searchHandler.js         # Search functionality
├── package.json             # Extension manifest
├── README.md                # This file
└── CHANGELOG.md             # Version history
```

---

## 📝 Git Configuration and Initial Commit
```bash
# Configure git user (if not already configured)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add all files to git
git add .

# Commit initial version
git commit -m "Initial commit: Smart Suggestion Extension"

# Push to remote repository (if repository exists)
git push -u origin main
```

---

## 🔄 Development Workflow

### 1. Making Changes and Committing
```bash
# 1. Make your code changes
# 2. Test the extension (see Testing section below)

# 3. Stage changes
git add .

# 4. Commit changes with descriptive message
git commit -m "feat: added new search functionality"

# 5. Push to repository
git push origin main
```

### 2. Adding New Dependencies
```bash
# Install new package
npm install package-name

# Install as development dependency
npm install --save-dev package-name

# Update package.json automatically
npm install --save package-name
```

### 3. Updating Existing Dependencies
```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm update package-name
```

---

## 📦 Loading and Managing Dependencies

### Core Dependencies
- **natural** (^6.3.0) – Natural language processing for intelligent search  
- **vscode** (^1.1.37) – VS Code extension API  

### Dependency Management
```bash
# View installed dependencies
npm list

# View production dependencies only
npm list --production=true

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities (if possible)
npm audit fix
```

---

## 🧪 Testing the Extension

### 1. Running in Development Mode
```bash
# Open the project in VS Code
code .

# Press F5 to launch Extension Development Host
# This opens a new VS Code window with your extension loaded
```

### 2. Testing Workflow
- Launch **Extension Development Host** (F5)  
- **Open Smart Suggestion View**: Click the Smart Suggestion icon in the activity bar  
- **Test Search**: Type in the search box to test suggestions  
- **Test @-trigger**: Type `@` in any code file to test context-aware suggestions  
- **Test Insertion**: Click on suggestions to test code insertion  

### 3. Debugging
```bash
# Check console logs in Development Host
# Use debugger statements in code
# Check VS Code Developer Tools (Help > Toggle Developer Tools)
```

### 4. Package and Install
```bash
# Package the extension
npm run package

# This creates a .vsix file in the project root
# Install via: Extensions → Install from VSIX...
```

---

## ⚙️ Configuration Files

### 1. `package.json`
Main extension manifest with:
- Extension metadata and configuration  
- Dependencies and scripts  
- VS Code contribution points  

### 2. Suggestion Data Files
Located in `resources/nms_sources/`:
- `jbot_commands.json`: Default command suggestions  
- `code_snippets.json`: Code snippet suggestions  

**Example structure:**
```json
[
  {
    "title": "For Loop",
    "description": "A standard for loop to iterate over a range of values",
    "code": "for (let i = 0; i < array.length; i++) {
  // Your code here
}",
    "icon": "🔁"
  }
]
```

---

## 🛠 Troubleshooting

### Common Issues
**Natural module not found:**
```bash
npm install natural
```

**Permission denied for GitHub:**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/username/repo.git
```

**Extension not loading:**  
- Check console logs in Developer Tools  
- Verify all dependencies are installed  

**Search not working:**  
- Check JSON files in `resources/nms_sources/`  
- Verify file formatting is correct  

### Debug Tips
- Check VS Code Developer Tools for error messages  
- Use `console.log()` statements in your code  
- Verify all file paths are correct  
- Check JSON syntax in data files  

---

## 🤝 Contributing
- Fork the repository  
- Create a feature branch: `git checkout -b feature-name`  
- Make your changes and test thoroughly  
- Commit your changes: `git commit -am 'Add new feature'`  
- Push to the branch: `git push origin feature-name`  
- Submit a pull request  

---

## 📜 Version History
- **0.0.1 (2023-11-20)**  
  - Initial release  
  - Basic sidebar suggestion panel  
  - @-triggered suggestions  
  - File-based suggestion system  

---

## 📄 License
This project is licensed under the **MIT License** – see the LICENSE file for details.

---

## 💬 Support
If you encounter any problems or have questions:
- Check the troubleshooting section above  
- Search existing GitHub issues  
- Create a new issue with detailed information  
- Include error messages and reproduction steps  

---

## 📚 Resources
- [VS Code Extension API](https://code.visualstudio.com/api)  
- [Natural NLP Documentation](https://naturalnode.github.io/natural/)  
- [Git Documentation](https://git-scm.com/doc)  
- [npm Documentation](https://docs.npmjs.com/)  

---

Happy Coding! 🎉
