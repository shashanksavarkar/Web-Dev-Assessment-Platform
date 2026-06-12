/**
 * Monaco Editor custom helpers for HTML/CSS auto-completion and auto-tag closure.
 */

/**
 * Dynamically imports and registers Emmet support for HTML and CSS models in the window.
 * Runs once per session.
 */
export const initEmmet = (monaco) => {
  if (!window.emmetInitialized) {
    import("emmet-monaco-es").then(({ emmetHTML, emmetCSS }) => {
      emmetHTML(monaco, ["html"]);
      emmetCSS(monaco, ["css"]);
      window.emmetInitialized = true;
    }).catch(err => {
      console.error("Failed to load emmet-monaco-es:", err);
    });
  }
};

/**
 * Listens to typing events and automatically closes HTML tags.
 * Ignores self-closing HTML tags (like base, br, hr, img, input, link, meta).
 */
export const setupAutoCloseTags = (editor, monaco) => {
  editor.onDidChangeModelContent((e) => {
    if (e.changes.length !== 1) return;
    const change = e.changes[0];
    if (change.text !== ">") return;

    const model = editor.getModel();
    if (!model) return;
    const lang = (model.getLanguageId?.() || model.getModeId?.() || "").toLowerCase();
    if (lang !== "html") return;

    const position = editor.getPosition();
    if (!position) return;

    const lineContent = model.getLineContent(position.lineNumber);
    const textBeforeCursor = lineContent.substring(0, position.column - 1);
    const textBeforeTagClose = textBeforeCursor.slice(0, -1);

    const match = textBeforeTagClose.match(/<([a-zA-Z0-9\-]+)(?:\s+[^<>\/]*?)?$/);
    if (!match) return;

    const tagName = match[1];
    const selfClosingTags = [
      "area", "base", "br", "col", "embed", "hr", "img", "input",
      "link", "meta", "param", "source", "track", "wbr"
    ];

    if (selfClosingTags.includes(tagName.toLowerCase())) return;

    const closingTag = `</${tagName}>`;

    setTimeout(() => {
      const currentPos = editor.getPosition();
      if (!currentPos || currentPos.lineNumber !== position.lineNumber || currentPos.column !== position.column) return;

      editor.executeEdits("auto-close-tags", [
        {
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          text: closingTag,
          forceMoveMarkers: true
        }
      ]);
      editor.setPosition(position);
    }, 0);
  });
};
