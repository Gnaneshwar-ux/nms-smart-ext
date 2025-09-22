const vscode = require('vscode');
const path = require('path');
const SearchHandler = require('./searchHandler');

function activate(context) {
  console.log('✅ Smart Suggestion extension activated');

  // Initialize search handler with extension path
  const extensionPath = context.extensionPath;
  const resourcesPath = path.join(extensionPath, 'resources', 'nms_sources');
  const searchHandler = new SearchHandler(resourcesPath);

  const provider = new SmartSuggestionViewProvider(context.extensionUri, searchHandler);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'smartSuggestionView',
      provider,
      { 
        webviewOptions: { 
          retainContextWhenHidden: true 
        }
      }
    )
  );

  // Register command to focus the view
  context.subscriptions.push(
    vscode.commands.registerCommand('smartSuggestionView.focus', () => {
      vscode.commands.executeCommand('smartSuggestionView.focus');
    })
  );

  // Register command to insert text at cursor
  context.subscriptions.push(
    vscode.commands.registerCommand('smartSuggestion.insertText', (text) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.edit(editBuilder => {
          editBuilder.replace(editor.selection.active, text);
        });
      }
    })
  );

  // Listen for text changes in active editor
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document === vscode.window.activeTextEditor?.document) {
        const cursorPos = vscode.window.activeTextEditor.selection.active;
        const lineText = event.document.lineAt(cursorPos.line).text;
        
        // Check if the line contains @ symbol
        const atIndex = lineText.lastIndexOf('@', cursorPos.character);
        if (atIndex !== -1) {
          const query = lineText.substring(atIndex + 1, cursorPos.character);
          provider.handleAtSymbolSearch(query);
        }
      }
    })
  );
}

class SmartSuggestionViewProvider {
  constructor(extensionUri, searchHandler) {
    this._extensionUri = extensionUri;
    this._view = null;
    this._searchHandler = searchHandler;
  }

  resolveWebviewView(webviewView, context, token) {
    console.log('✅ resolveWebviewView called');
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtml(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'search':
            this._handleSearch(message.text);
            return;
          case 'insertText':
            vscode.commands.executeCommand('smartSuggestion.insertText', message.text);
            return;
        }
      },
      undefined,
      context.subscriptions
    );
  }

  async handleAtSymbolSearch(query) {
    if (!this._view) return;
    
    if (query.length > 0) {
      const results = await this._searchHandler.search(query);
      this._updateWebview(results, true);
    }
  }

  async _handleSearch(text) {
    if (!this._view) return;
    
    const results = await this._searchHandler.search(text);
    this._updateWebview(results, false);
  }

  _updateWebview(results, isAtSearch) {
    const html = results.length > 0 ? results.map(result => `
      <div class="suggestion-card" data-code="${this._escapeHtml(result.code)}">
        <div class="suggestion-header">
          <span class="suggestion-icon">${result.icon || '💡'}</span>
          <h3 class="suggestion-title">${result.title}</h3>
          <button class="copy-btn" title="Copy to cursor">📋</button>
        </div>
        <p class="suggestion-description">${result.description}</p>
        <div class="suggestion-code">${this._escapeHtml(result.code)}</div>
      </div>
    `).join('') : `
      <div class="no-results">
        <div class="icon">🔍</div>
        <p>No suggestions found</p>
        <p>Try a different search term or use @ in your code</p>
      </div>
    `;

    this._view.webview.postMessage({
      command: 'showResults',
      html: html,
      isAtSearch: isAtSearch
    });
  }

  _escapeHtml(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  _getHtml(webview) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: var(--vscode-font-family); 
            padding: 16px; 
            background-color: var(--vscode-sideBar-background);
            color: var(--vscode-sideBar-foreground);
            margin: 0;
          }
          
          .search-container {
            position: sticky;
            top: 0;
            background-color: var(--vscode-sideBar-background);
            padding: 8px 0 16px 0;
            z-index: 10;
          }
          
          #inputBox { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
          }
          
          #inputBox:focus {
            outline: 1px solid var(--vscode-focusBorder);
          }
          
          .at-search-indicator {
            display: flex;
            align-items: center;
            margin: 12px 0;
            padding: 8px 12px;
            background-color: var(--vscode-textCodeBlock-background);
            border-radius: 4px;
            font-size: 13px;
          }
          
          .at-search-indicator .icon {
            margin-right: 8px;
            color: var(--vscode-button-background);
          }
          
          .suggestions-container {
            margin-top: 12px;
          }
          
          .suggestion-card {
            background: var(--vscode-quickInput-background);
            margin: 0 0 16px 0;
            padding: 16px;
            border-radius: 6px;
            border-left: 4px solid var(--vscode-button-background);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
          }
          
          .suggestion-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px; /* small space between icon/title/button */
}

.suggestion-icon {
  flex: 0 0 auto; /* fixed */
}

.suggestion-title {
  flex: 1 1 auto;        /* allow shrink */
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--vscode-button-foreground);
  overflow: hidden;      /* hide overflow */
  text-overflow: ellipsis;
  white-space: nowrap;   /* one line */
  min-width: 0;          /* IMPORTANT for flexbox shrink */
}

.copy-btn {
  flex: 0 0 auto; /* keep button fixed */
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 3px;
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
}

          
          .copy-btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
          }
          
          .suggestion-description {
            margin: 0 0 12px 0;
            font-size: 13px;
            line-height: 1.5;
            color: var(--vscode-descriptionForeground);
          }
          
          .suggestion-code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 12px;
            border-radius: 4px;
            font-family: var(--vscode-editor-font-family);
            font-size: 13px;
            overflow-x: auto;
            white-space: pre-wrap;
            border: 1px solid var(--vscode-input-border);
          }
          
          .no-results {
            text-align: center;
            padding: 32px 16px;
            color: var(--vscode-descriptionForeground);
          }
          
          .no-results .icon {
            font-size: 32px;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="search-container">
          <input id="inputBox" type="text" placeholder="Type to search or use @ in your code..." />
          <div id="atSearchIndicator" class="at-search-indicator" style="display: none;">
            <span class="icon">@</span>
            <span>Showing suggestions based on your code context</span>
          </div>
        </div>
        
        <div id="results" class="suggestions-container"></div>
        
        <script>
          const vscode = acquireVsCodeApi();
          const inputBox = document.getElementById('inputBox');
          const atSearchIndicator = document.getElementById('atSearchIndicator');
          const resultsContainer = document.getElementById('results');
          let timeoutId;

          inputBox.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              vscode.postMessage({ 
                command: 'search', 
                text: e.target.value 
              });
            }, 300);
          });

          inputBox.focus();

          window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'showResults') {
              if (message.isAtSearch) {
                atSearchIndicator.style.display = 'flex';
                inputBox.value = '';
              } else {
                atSearchIndicator.style.display = 'none';
              }
              
              resultsContainer.innerHTML = message.html;
              
              // Add event listeners to suggestion cards
              document.querySelectorAll('.suggestion-card').forEach(card => {
                card.addEventListener('click', (e) => {
                  if (!e.target.classList.contains('copy-btn')) {
                    const code = card.dataset.code;
                    vscode.postMessage({
                      command: 'insertText',
                      text: code
                    });
                  }
                });
              });
              
              // Add event listeners to copy buttons
              document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  const card = btn.closest('.suggestion-card');
                  const code = card.dataset.code;
                  vscode.postMessage({
                    command: 'insertText',
                    text: code
                  });
                });
              });
            }
          });
        </script>
      </body>
      </html>`;
  }
}

function deactivate() {}

module.exports = { activate, deactivate };