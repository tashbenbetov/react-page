import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import HtmlToSlate from '../HtmlToSlate';
import { SlatePlugin } from '../types/SlatePlugin';

const withPaste = (plugins: SlatePlugin[], defaultPluginType: string) => (
  editor: ReactEditor
) => {
  const { insertData } = editor;
  const htmlToSlate = HtmlToSlate({ plugins });
  editor.insertData = data => {
    const html = data.getData('text/html');
    if (html) {
      const { slate } = htmlToSlate(html);

      Transforms.insertFragment(editor, slate);
      return;
    }

    const text = data.getData('text/plain');
    if (text) {
      // if there are two subsequent line breks, insert paragraph, otherway insert soft line break
      const lines = text.split('\n');

      let nextWillbeParagraph = false;
      for (let i = 0; i < lines.length; i++) {
        const thisLine = lines[i];
        const nextLine = lines[i + 1];

        if (!thisLine.trim()) {
          // this line is empty,
          nextWillbeParagraph = true;
        } else if (nextWillbeParagraph) {
          Transforms.insertNodes(editor, {
            type: defaultPluginType,
            children: [{ text: thisLine }],
          });
          nextWillbeParagraph = false;
        } else {
          // add a \n, unless the next line is empty, then its either the last entry or the following wil be a paragraph
          const nextIsEmpty = !nextLine || !nextLine.trim();

          Transforms.insertText(editor, thisLine + (nextIsEmpty ? '' : '\n'));
          nextWillbeParagraph = false;
        }
      }
      return;
    }

    insertData(data);
  };
  return editor;
};

export default withPaste;
