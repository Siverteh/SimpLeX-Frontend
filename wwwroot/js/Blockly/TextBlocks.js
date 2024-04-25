import {FieldImageButton} from "./ImageBlocks.js";
export var currentQuillInstance = null;

export class FieldRichTextEditor extends Blockly.Field {
    constructor(text, opt_validator) {
        super(text, opt_validator);
        this.SERIALIZABLE = true;
        this.value_ = text || '';
        this.quill = null;
    }

    static fromJson(options) {
        return new FieldRichTextEditor(options.text);
    }

    showEditor_() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        overlay.style.zIndex = '1000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        document.body.appendChild(overlay);

        const editorContainer = document.createElement('div');
        editorContainer.style.backgroundColor = '#fff';
        editorContainer.style.borderRadius = '8px';
        editorContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        editorContainer.style.padding = '10px';
        editorContainer.style.position = 'relative';
        editorContainer.style.width = '80%';
        editorContainer.style.maxWidth = '600px';
        editorContainer.style.overflowY = 'auto';
        editorContainer.style.maxHeight = '80vh';
        overlay.appendChild(editorContainer);

        let isDragging = false;

        overlay.addEventListener('mousedown', function() {
            isDragging = false;
        });

        overlay.addEventListener('mousemove', function() {
            isDragging = true;
        });

        overlay.addEventListener('mouseup', (event) => {
            if (event.target === overlay && !isDragging) {
                this.closeEditor();
            }
        });

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.cursor = 'pointer';
        editorContainer.appendChild(closeButton);

        const quillEditorDiv = document.createElement('div');
        editorContainer.appendChild(quillEditorDiv);

        const icons = Quill.import('ui/icons');
        icons['cite'] = '<i class="fa fa-book"></i>';

        this.quill = new Quill(quillEditorDiv, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: [
                        ['bold', 'italic', 'underline'],
                        ['cite']
                    ],
                    handlers: {
                        'cite': () => {
                            $('#citationGalleryModal').modal('show');
                        }
                    }
                },
                clipboard: {
                    matchVisual: false
                }
            },
            formats: ['bold', 'italic', 'underline', 'list', 'bullet', 'link']
        });
        this.quill.root.innerHTML = this.convertLatexToHtml(this.value_);

        currentQuillInstance = this.quill;

        closeButton.onclick = () => this.closeEditor();
    }

    closeEditor() {
        const newValue = this.convertHtmlToLatex(this.quill.root.innerHTML);
        this.setValue(newValue);
        document.body.removeChild(this.quill.container.parentNode.parentNode); // Remove overlay
        currentQuillInstance = null;
    }

    convertHtmlToLatex(html) {
        // Escape LaTeX special characters
        html = html.replace(/&/g, '\\&');
        html = html.replace(/%/g, '\\%');
        html = html.replace(/\$/g, '\\$');
        html = html.replace(/#/g, '\\#');
        html = html.replace(/_/g, '\\_');

        // Normal HTML to LaTeX conversions
        html = html.replace(/<strong>(.*?)<\/strong>/g, '\\textbf{$1}');
        html = html.replace(/<em>(.*?)<\/em>/g, '\\textit{$1}');
        html = html.replace(/<u>(.*?)<\/u>/g, '\\underline{$1}');
        html = html.replace(/<br\s*\/?>/gi, '\\\\ ');
        html = html.replace(/<\/p>\s*<p>/g, '\\\\ \\\\ ');
        html = html.replace(/^<p>|<\/p>$/g, '');
        html = html.replace(/(\\\\\s*){2,}/g, '\\\\ \\\\ ');

        // Convert human-readable citation tags to LaTeX \cite commands
        html = html.replace(/\[Cite: ([^\]]+)\]/g, '\\cite{$1}');

        return html.trim();
    }


    convertLatexToHtml(latex) {
        // Convert \cite commands to human-readable format immediately for editor display
        latex = latex.replace(/\\cite{([^}]+)}/g, '[Cite: $1]');

        // Standard LaTeX to HTML formatting
        latex = latex.replace(/\\textbf{(.*?)}/g, '<strong>$1</strong>');
        latex = latex.replace(/\\textit{(.*?)}/g, '<em>$1</em>');
        latex = latex.replace(/\\underline{(.*?)}/g, '<u>$1</u>');
        latex = latex.replace(/\\\\ \\\\ /g, '</p><p>');
        latex = latex.replace(/\\\\ /g, '<br>');

        if (!/^<p>/.test(latex)) {
            latex = `<p>${latex}</p>`;
        }

        return latex;
    }

    setValue(newValue) {
        if (this.value_ !== newValue) {
            this.value_ = newValue;
            this.forceRerender();
            if (this.sourceBlock_) {
                Blockly.Events.fire(new Blockly.Events.BlockChange(this.sourceBlock_, 'field', this.name, null, newValue));
            }
        }
    }

    getValue() {
        return this.value_;
    }
}

Blockly.fieldRegistry.register('field_rich_text_editor', FieldRichTextEditor);

Blockly.Blocks['regular_text_block'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Regular text block");

        this.appendDummyInput()
            .appendField(new FieldRichTextEditor("Type text here..."), "TEXT");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("A block for normal text input.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['regular_text_block'] = function(block) {
    var text = block.getFieldValue('TEXT');
    // The text is already in LaTeX format.
    return text + '\n';
};

Blockly.Blocks['text_left_image_right_multicolumn'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Multicolumn text: Text Left - Image Right");

        this.appendDummyInput()
            .appendField(new FieldRichTextEditor("Type text here..."), "TEXT");

        this.appendDummyInput()
            .appendField("Text width:")
            .appendField(new Blockly.FieldDropdown([
                ["10%", "0.1"],
                ["20%", "0.2"],
                ["30%", "0.3"],
                ["40%", "0.4"],
                ["45%", "0.45"]
            ]), "TEXT_WIDTH");

        this.appendDummyInput()
            .appendField(new FieldImageButton("Select Image"), "SRC");

        this.appendDummyInput()
            .appendField("Image width:")
            .appendField(new Blockly.FieldDropdown([
                ["10%", "0.1"],
                ["20%", "0.2"],
                ["30%", "0.3"],
                ["40%", "0.4"],
                ["45%", "0.45"]
            ]), "IMAGE_WIDTH");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Inserts a multicolumn layout with image and text.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['text_left_image_right_multicolumn'] = function(block) {
    var text = block.getFieldValue('TEXT');
    var textWidth = block.getFieldValue('TEXT_WIDTH');
    var imageSrc = block.getFieldValue('SRC');
    var imageWidth = block.getFieldValue('IMAGE_WIDTH');
    var code = `
\\begin{minipage}{${textWidth}\\textwidth}
\\vspace{-5.2cm}
${text}
\\end{minipage}
\\hspace{0.05\\textwidth}
\\begin{minipage}{${imageWidth}\\textwidth}
\\includegraphics[width = \\textwidth]{/data/images/${imageSrc}}
\\end{minipage}
`;
    return code;
};

Blockly.Blocks['image_left_text_right_multicolumn'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Multicolumn text: Image Left - Text Right");

        this.appendDummyInput()
            .appendField(new FieldImageButton("Select Image"), "IMAGE_SRC");

        this.appendDummyInput()
            .appendField("Image width:")
            .appendField(new Blockly.FieldDropdown([
                ["10%", "0.1"],
                ["20%", "0.2"],
                ["30%", "0.3"],
                ["40%", "0.4"],
                ["45%", "0.45"]
            ]), "IMAGE_WIDTH");

        this.appendDummyInput()
            .appendField(new FieldRichTextEditor("Type text here..."), "TEXT");

        this.appendDummyInput()
            .appendField("Text width:")
            .appendField(new Blockly.FieldDropdown([
                ["10%", "0.1"],
                ["20%", "0.2"],
                ["30%", "0.3"],
                ["40%", "0.4"],
                ["45%", "0.45"]
            ]), "TEXT_WIDTH");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Inserts a multicolumn layout with image on the left and text on the right.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['image_left_text_right_multicolumn'] = function(block) {
    var imageSrc = block.getFieldValue('SRC');
    var imageWidth = block.getFieldValue('IMAGE_WIDTH');
    var text = block.getFieldValue('TEXT');
    var textWidth = block.getFieldValue('TEXT_WIDTH');
    var code = `
\\begin{minipage}{${imageWidth}\\textwidth}
\\includegraphics[width=\\textwidth]{/data/images/${imageSrc}}
\\end{minipage}
\\hspace{0.05\\textwidth}
\\begin{minipage}{${textWidth}\\textwidth}
\\vspace{-5.2cm}
${text}
\\end{minipage}
`;
    return code;
};

Blockly.Blocks['text_left_text_right_multicolumn'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Multicolumn text: Text Left - Text Right");

        this.appendDummyInput()
            .appendField(new FieldRichTextEditor("Type left text here..."), "LEFT_TEXT");

        this.appendDummyInput()
            .appendField("Left text width:")
            .appendField(new Blockly.FieldDropdown([
                ["10%", "0.1"],
                ["20%", "0.2"],
                ["30%", "0.3"],
                ["40%", "0.4"],
                ["45%", "0.45"]
            ]), "LEFT_TEXT_WIDTH");

        this.appendDummyInput()
            .appendField(new FieldRichTextEditor("Type right text here..."), "RIGHT_TEXT");

        this.appendDummyInput()
            .appendField("Right text width:")
            .appendField(new Blockly.FieldDropdown([
                ["10%", "0.1"],
                ["20%", "0.2"],
                ["30%", "0.3"],
                ["40%", "0.4"],
                ["45%", "0.45"]
            ]), "RIGHT_TEXT_WIDTH");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Inserts a multicolumn layout with text on both the left and the right.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['text_left_text_right_multicolumn'] = function(block) {
    var leftText = block.getFieldValue('LEFT_TEXT');
    var leftTextWidth = block.getFieldValue('LEFT_TEXT_WIDTH');
    var rightText = block.getFieldValue('RIGHT_TEXT');
    var rightTextWidth = block.getFieldValue('RIGHT_TEXT_WIDTH');
    var code = `
\\begin{minipage}{${leftTextWidth}\\textwidth}
${leftText}
\\end{minipage}
\\hspace{0.05\\textwidth}
\\begin{minipage}{${rightTextWidth}\\textwidth}
${rightText}
\\end{minipage}
`;
    return code;
};

Blockly.Blocks['latex_href'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Hyperlink");
        this.appendDummyInput()
            .appendField("URL")
            .appendField(new Blockly.FieldTextInput("http://example.com"), "URL");
        this.appendDummyInput()
            .appendField("Link text")
            .appendField(new Blockly.FieldTextInput("Click here"), "TEXT");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Creates a hyperlink.");
        this.setHelpUrl(""); // Optionally, add a URL to a help page
    }
};

Blockly.JavaScript['latex_href'] = function(block) {
    var url = block.getFieldValue('URL');
    var text = block.getFieldValue('TEXT');
    var code = `\\href{${url}}{${text}}\n`;
    return code;
};


