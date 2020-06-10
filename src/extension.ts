
'use strict'
import { commands, ExtensionContext, window, workspace, Range, Position, TextEditorRevealType, TextEditorDecorationType} from 'vscode'

export async function activate(context: ExtensionContext) {
    let cursorLine = defaultHighlight();
    let activeEditor = window.activeTextEditor;
    let lastActivePosition;
    let lineStatus = false
    window.onDidChangeActiveTextEditor(() => {
        try {
            activeEditor = window.activeTextEditor
            cursorLine.dispose();
            cursorLine = defaultHighlight();
            lineStatus = false
        } catch (error){
            console.error("Error from ' window.onDidChangeActiveTextEditor' -->", error)
        } finally {
            lastActivePosition = new Position(activeEditor!.selection.active.line, activeEditor!.selection.active.character);
        }
    })

    function setHighlight(cursorLine: TextEditorDecorationType, updateAllVisibleEditors=false) {
        try {
            if (updateAllVisibleEditors) {
                window.visibleTextEditors.forEach((editor) => {
                    const currentPosition = editor.selection.active;
                    const currentLine = editor.selection.active.line;
                    const newHighlight = { range: new Range(currentPosition, currentPosition) };
                    editor.setDecorations(cursorLine, [newHighlight]);
                });
            }

            else {
                window.visibleTextEditors.forEach((editor) => {
                    if(editor !== window.activeTextEditor) return;               
                    const currentPosition = editor.selection.active
                    const newHighlight = { range: new Range(currentPosition, currentPosition) }
                    editor.revealRange( new Range(currentPosition, currentPosition),TextEditorRevealType.InCenterIfOutsideViewport)
                    editor.setDecorations(cursorLine, [newHighlight])
                });
            }
        } 
        catch (error){
            console.error("Error from ' setHighlight' -->", error)
        } finally {
            lastActivePosition = new Position(activeEditor!.selection.active.line, activeEditor!.selection.active.character);
        }
    }


    workspace.onDidChangeConfiguration(() => {
        cursorLine.dispose();
        cursorLine = defaultHighlight();
        lineStatus = false
    })

    window.onDidChangeTextEditorSelection(() => {
        activeEditor = window.activeTextEditor;   
        cursorLine.dispose();
        cursorLine = defaultHighlight();
        lineStatus=false
    })

    let disposable = commands.registerCommand('locatecursor.helloWorld', () => {
        if (lineStatus === false) {
            lineStatus=true
            setHighlight(cursorLine);           
        } else {
            lineStatus=false
            cursorLine.dispose();
            cursorLine = defaultHighlight();
        }
        
	});
	context.subscriptions.push(disposable);
}


function defaultHighlight() {
    const cursorLine = window.createTextEditorDecorationType({
        isWholeLine: true,
        borderWidth: `2px 0 2px 0`,
        borderStyle: "solid",
        border: "solid",
        borderColor: "#d400ff"
    })
    return cursorLine;
}
export function deactivate() {
}