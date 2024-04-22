export class FieldHTMLTextInput extends Blockly.Field {
    constructor(value, options) {
        super(value);
        this.SERIALIZABLE = true;
        this.value_ = value;
        this.options_ = options || {};
    }

    static fromJson(options) {
        return new FieldHTMLTextInput(options['text'], options);
    }

    showEditor_() {
        const div = document.createElement('div');
        document.body.appendChild(div);

        // Apply styles to the container div
        div.style.position = 'absolute';
        div.style.zIndex = '1000'; // Ensure it's above other elements

        const textarea = document.createElement('textarea');
        textarea.value = this.value_;

        // Styling the textarea for a better visual integration
        textarea.style.width = '500px'; // Adjust width as needed
        textarea.style.height = '300px'; // Adjust height as needed
        textarea.style.fontSize = '14px'; // Match Blockly's font size
        textarea.style.border = '1px solid #ccc'; // Light border to match Blockly aesthetic
        textarea.style.borderRadius = '4px'; // Rounded corners
        textarea.style.padding = '5px'; // Padding inside the textarea
        textarea.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)'; // Soft shadow for depth
        textarea.style.resize = 'none'; // Disable resizing to maintain consistent appearance

        div.appendChild(textarea);

        // Positioning logic remains as previously outlined
        // This example uses the block's position as a base for the placement
        const blockPosition = this.sourceBlock_.getRelativeToSurfaceXY();
        const scale = this.sourceBlock_.workspace.scale;
        const fieldPosition = this.getAbsoluteXY_();
        div.style.left = `${fieldPosition.x}px`;
        div.style.top = `${fieldPosition.y}px`;
        div.style.transform = `scale(${scale})`;
        div.style.transformOrigin = 'left top';

        textarea.focus();
        textarea.select();

        textarea.onblur = () => {
            this.setValue(textarea.value);
            div.remove(); // Clean up the div when the textarea loses focus
        };
    }

    render_() {
        // Set the field's text to a truncated version of the textarea's content
        this.text_ = this.value_;
        super.render_();
    }

    setValue(newValue) {
        if (this.value_ !== newValue) {
            const oldValue = this.value_;
            this.value_ = newValue;
            this.forceRerender();

            // Generate a Blockly change event for this field change
            Blockly.Events.fire(new Blockly.Events.BlockChange(
                this.sourceBlock_, 'field', this.name, oldValue, newValue));
        }
    }


    getValue() {
        return this.value_;
    }
}

Blockly.fieldRegistry.register('field_html_text_input', FieldHTMLTextInput);

Blockly.Blocks['text_input_block'] = {
    init: function() {
        this.jsonInit({
            "message0": "Text input %1",
            "args0": [
                {
                    "type": "field_html_text_input",
                    "name": "TEXT_INPUT",
                    "text": "Enter text here",
                }
            ],
            "colour": 160,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": "Custom text input block.",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['text_input_block'] = function(block) {
    return block.getFieldValue('TEXT_INPUT') + '\n';
};

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
        html = html.replace(/{/g, '\\{');
        html = html.replace(/}/g, '\\}');
        html = html.replace(/%/g, '\\%');
        html = html.replace(/\$/g, '\\$');
        html = html.replace(/#/g, '\\#');
        html = html.replace(/_/g, '\\_');
        html = html.replace(/\[/g, '\\[');
        html = html.replace(/]/g, '\\]');

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


Blockly.Blocks['rich_text'] = {
    init: function() {
        this.jsonInit({
            "message0": "Rich text %1",
            "args0": [
                {
                    "type": "field_rich_text_editor",
                    "name": "TEXT",
                    "text": "Type here...",
                }
            ],
            "colour": 160,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": "A block for rich text input.",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['rich_text'] = function(block) {
    var text = block.getFieldValue('TEXT');
    // The text is already in LaTeX format.
    return text + '\\\\ \\\\ \n';
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


