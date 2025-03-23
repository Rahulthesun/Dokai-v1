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

	
	vscode.workspace.onDidSaveTextDocument((document) => {
		let filetype=new Map([
			[".py","def"],
			[".js","function"]
		])
		const fileName = document.uri.fsPath;
		const extname = fileName.slice(fileName.lastIndexOf("."));
		const filecontent=document.getText();
		let textarr=filecontent.split(" ");
		const checkpoint=[];
		let count=0;
		const functionarr=[]

		vscode.window.setStatusBarMessage("Docs are being written" , 5000);

		if (filecontent)
			console.log("File content logged on save");
		else
			console.log("File content Not logged on save");
		
		let flag=true
		//Gets the starting index of each function keyword
		textarr.forEach(function(word){
			if (word==filetype.get(extname)){
				checkpoint.push(count);
				flag=true;
			}
			//Push functionname if previous word was function keyword
			if (flag==true){
				functionarr.push(word);
				flag=false;
			}
			count+=(word.length +1);
				
			
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
