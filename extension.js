// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');

let isDocModeEnabled = false; 


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Welcome to dokai AI Doc Editor');
	let ctrlPressed = false;
	let functionnamelist=new Set();
	//const filecontentarr=document.getText().split("\n");
	vscode.workspace.onDidChangeTextDocument((event) => {
		let filetype=new Map([
			[".py","def"],
			[".js","function"]
		])
		const fileName = event.document.uri.fsPath;
		const filecontentarr=event.document.getText().split("\n");
		const extname = fileName.slice(fileName.lastIndexOf("."));
		 
		const changes = event.contentChanges;
		const editor = vscode.window.activeTextEditor;
        if (editor) {
            let cursorPosition = editor.selection.active;
			let changedline=cursorPosition.line;
			let changedchar=cursorPosition.character;
			let keyword=filetype.get(extname);

			const functionnamelist = new Set();
			const functionlocations = new Map();

			for (let i = changedline; i >= 0; i--) {
				if (filecontentarr[i].includes(keyword)) {
					const regex = new RegExp(`\\b${keyword}\\b\\s+(\\w+)`, 'g');
					const matches = filecontentarr[i].matchAll(regex);
					for (const match of matches) {
						// Find function end by tracking indentation or block(Pls change this in the future)
						let endLine = i;
						let startIndent = filecontentarr[i].search(/\S/);
						
						// Find function end by checking indentation
						for (let j = i + 1; j < filecontentarr.length; j++) {
							let currentIndent = filecontentarr[j].search(/\S/);
							if (currentIndent <= startIndent && filecontentarr[j].trim() !== '') {
								endLine = j - 1;
								break;
							}
						}
						const functionName = match[1];
						const functionInfo = {
							name: functionName,
							startLine: i,
							endLine: endLine,
							startCharacter: match.index,
							endCharacter: filecontentarr[i].length
						};
						if (functionlocations.has(functionName)) {
							const existingFunc = functionlocations.get(functionName);
							functionlocations.set(functionName, {
								...existingFunc,
								startLine: i,
								endLine: endLine
							});
						}
						else {
							// Add new function
							functionlocations.set(functionName, functionInfo);
						}

							functionnamelist.add(functionName);
					}			
			}
		}
	}
	
	})

	
	vscode.workspace.onDidSaveTextDocument((document) => {
		let filetype=new Map([
			[".py","def"],
			[".js","function"]
		])
		const fileName = document.uri.fsPath;
		const filecontentarr=document.getText().split("\n");
		const extname = fileName.slice(fileName.lastIndexOf("."));
		let filecontent=document.getText;
		
		const checkpoint=[];
		let count=0;
		const functionarr=[]

		vscode.window.setStatusBarMessage("Docs are being written" , 5000);

		const functionLocations = new Map();

		if (filecontent)
			console.log("File content logged on save");
		else
			console.log("File content Not logged on save");
		
			filecontentarr.forEach((line, lineIndex) => {
				const keyword = filetype.get(extname);
				if (line.includes(keyword)) {
					const regex = new RegExp(`\\b${keyword}\\b\\s+(\\w+)`);
					const match = line.match(regex);
					
					if (match) {
						// Find function end by tracking indentation(yeah change)
						let endLine = lineIndex;
						let startIndent = line.search(/\S/);
						
						for (let j = lineIndex + 1; j < filecontentarr.length; j++) {
							let currentIndent = filecontentarr[j].search(/\S/);
							if (currentIndent <= startIndent && filecontentarr[j].trim() !== '') {
								endLine = j - 1;
								break;
							}
						}
		
						const functionName = match[1];
		
						// Updating existing function or add new one
						if (functionLocations.has(functionName)) {
							const existingFunc = functionLocations.get(functionName);
							functionLocations.set(functionName, {
								...existingFunc,
								startLine: lineIndex,
								endLine: endLine
							});
						} else {
							functionLocations.set(functionName, {
								name: functionName,
								startLine: lineIndex,
								endLine: endLine
							});
						}
		
						checkpoint.push(count);
						functionarr.push(functionName);
					}
				}
				count += (line.length + 1);
				
			
		})
		vscode.window.setStatusBarMessage("Documenation completed" , 5000);
		console.log("Checkpoint:",checkpoint);

			

			

		})


	let docmodeToggle = vscode.commands.registerCommand("dokai.autodocMode" , async () => {
		isDocModeEnabled = !isDocModeEnabled;
		if (isDocModeEnabled) {
			vscode.window.setStatusBarMessage("Dokai Auto-Doc Mode Activated" , 5000);
		} else {
			vscode.window.setStatusBarMessage("Dokai Auto-Doc Mode Deactivated" , 5000);
		}
	} ) 
	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let generateDocs = vscode.commands.registerCommand("dokai.generateDocs" , async (event) => {
		if (!isDocModeEnabled) return;

		const editor = vscode.window.activeTextEditor;

		if (!editor) {
		return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
		return;
		}

		const selectedText = editor.document.getText(selection);

		if (!selectedText.trim()) return ;

		vscode.window.setStatusBarMessage("Generating Docs ..." , 1000);				
		/*Just Trying to test out the extension before api connection with template data*/
		const testDocText = "#This is a test documentation template generated for every selected text \n";
		const newEdit = new vscode.WorkspaceEdit();
		const position = selection.start;
		newEdit.insert(editor.document.uri , position , testDocText);
	
		vscode.workspace.applyEdit(newEdit);

		});
	
	
	context.subscriptions.push(docmodeToggle);
	context.subscriptions.push(generateDocs);
}	

// This method is called when your extension is deactivated
function deactivate() {
	vscode.window.showInformationMessage("dokai Doc-Mode Deactivated");
	console.log('dokai Doc-Mode Deactivated');
}


module.exports = {
	activate,
	deactivate
}
