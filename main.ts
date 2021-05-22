import {App, MarkdownView, Plugin} from 'obsidian';

function makeWidget(): HTMLElement {
  let img = document.createElement('img');
  img.src = 'public/images/874d8b8e340f75575caa.svg';
  let widget = document.createElement('span');
  widget.appendChild(img);
  return widget;
}

export default class HideUrls extends Plugin {
  collapseUrls(cm: CodeMirror.Editor, line: number) {
    let tokens = cm.getLineTokens(line);
    for (let token of tokens) {
      if (token && token.type && token.type.includes("url") &&
          token.type.includes("string") && !token.type.includes("formatting")) {
        let start = {line : line, ch : token.start};
        let end = {line : line, ch : token.end};
        if (cm.findMarksAt(start).length > 0) {
          continue;
        }
        let widget = makeWidget();
        let marker = cm.markText(start, end,
                                 {replacedWith : widget, clearOnEnter : true});
        widget.onclick = (e) => {
          cm.setSelection(marker.find().from, marker.find().to);
          marker.clear();
          cm.focus();
        };
      }
    }
  }

  collapseAllUrls(cm: CodeMirror.Editor) {
    for (let line = 0; line < cm.getDoc().lineCount(); line++) {
      this.collapseUrls(cm, line);
    }
  }

  async onload() {
    this.app.workspace.on('file-open', () => {
      let view = this.app.workspace.activeLeaf.view;
      if (view instanceof MarkdownView) {
        let cm = view.sourceMode.cmEditor;
        this.collapseAllUrls(cm);
      }
    });

    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      cm.on("cursorActivity", (instance: any) => {
        let current_line_number = cm.getCursor().line;
        if (current_line_number != this.prev_line_number) {
          this.collapseUrls(cm, this.prev_line_number);
          this.prev_line_number = current_line_number;
        }
      });
    });
  }

  prev_line_number: number = 0;
}
