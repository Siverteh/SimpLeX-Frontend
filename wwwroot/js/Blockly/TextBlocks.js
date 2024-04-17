class FieldHTMLTextInput extends Blockly.Field {
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


class FieldRichTextEditor extends Blockly.Field {
    constructor(text, opt_validator) {
        super(text, opt_validator);
        this.SERIALIZABLE = true;
        this.value_ = text || '';
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
        overlay.appendChild(editorContainer);

        // Close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.cursor = 'pointer';
        editorContainer.appendChild(closeButton);

        // Quill editor div
        const quillEditorDiv = document.createElement('div');
        editorContainer.appendChild(quillEditorDiv);

        // Initialize Quill
        const quill = new Quill(quillEditorDiv, {
            theme: 'snow',
            // Include other necessary configurations for the toolbar
        });
        quill.root.innerHTML = this.convertLatexToHtml(this.value_);

        // Close editor on close button click
        closeButton.addEventListener('click', () => {
            // Get the new value from Quill
            const newValue = this.convertHtmlToLatex(quill.root.innerHTML);

            // Set the new value
            this.setValue(newValue); // Make sure this line correctly updates the value

            // Close the editor
            document.body.removeChild(overlay);
        });
    }
    convertHtmlToLatex(html) {
        html = html.replace(/<span class="ql-cursor">.*?<\/span>/g, '');

        html = html.replace(/<strong>(.*?)<\/strong>/g, '\\textbf{$1}');
        html = html.replace(/<em>(.*?)<\/em>/g, '\\textit{$1}');
        html = html.replace(/<u>(.*?)<\/u>/g, '\\underline{$1}');

        // Simplified handling of paragraphs to avoid introducing new lines for inline elements
        html = html.replace(/<\/p>\s*<p>/g, '\n\n').replace(/^<p>/, '').replace(/<\/p>$/, '');

        return html;
    }



    convertLatexToHtml(latex) {
        latex = latex.replace(/\\textbf{(.*?)}/g, '<strong>$1</strong>')
            .replace(/\\textit{(.*?)}/g, '<em>$1</em>')
            .replace(/\\underline{(.*?)}/g, '<u>$1</u>');

        // Convert explicit new lines in LaTeX to paragraph tags in HTML for clear separation
        latex = latex.replace(/\n\n/g, '</p><p>');

        // Wrap the entire content in a single paragraph if it doesn't already start with one
        if (!latex.startsWith('<p>')) {
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
    return text + '\n';
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

