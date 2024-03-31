//START BLOCK//

Blockly.Blocks['document_start_block'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Document Start Block");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField(new Blockly.FieldDropdown([["Article", "article"], ["Report", "report"], ["Book", "book"]]), "CLASS");
        this.setNextStatement(true, null);
        this.setColour(60);
        this.setTooltip("Start of your latex document");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['document_start_block'] = function(block) {
    var dropdown_class = block.getFieldValue('CLASS');
    var packages = [
        "\\usepackage[utf8]{inputenc}", // Input encoding
        "\\usepackage[T1]{fontenc}", // Font encoding
        "\\usepackage{amsmath}", // Advanced math typesetting
        "\\usepackage{amsfonts}", // Math fonts
        "\\usepackage{amssymb}", // Math symbols
        "\\usepackage{graphicx}", // Include graphics
    ].join('\n');

    var code = `\\documentclass{${dropdown_class}}\n${packages}\n\\begin{document}\n\\leavevmode\n`;
    return code;
};


//DOCUMENT STRUCTURE BLOCKS//

Blockly.Blocks['section'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Section");
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput("Enter section name here"), "section");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Block for creating a section in LaTeX");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['section'] = function(block) {
    var text_section_name = block.getFieldValue('section');
    // This now returns only the section code
    return '\\section{' + text_section_name + '}\n';
};

Blockly.Blocks['subsection'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Subsection");
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput("Enter subsection name here"), "subsection");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Block for creating a subsection in LaTeX");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['subsection'] = function(block) {
    var text_section_name = block.getFieldValue('subsection');
    // This now returns only the section code
    return '\\subsection{' + text_section_name + '}\n';
};

Blockly.Blocks['subsubsection'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Subsubsection");
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput("Enter subsubsection name here"), "subsubsection");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Block for creating a subsubsection in LaTeX");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['subsubsection'] = function(block) {
    var text_section_name = block.getFieldValue('subsubsection');
    // This now returns only the section code
    return '\\subsubsection{' + text_section_name + '}\n';
};


//DOCUMENT TEXT BLOCKS//

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


//LIST BLOCKS//

Blockly.Blocks['latex_item'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Item")
            .appendField(new Blockly.FieldTextInput("Enter item text here"), "ITEM_TEXT");
        this.setPreviousStatement(true, "latex_item"); // Allows chaining within "Itemize"
        this.setNextStatement(true, "latex_item");
        this.setColour(260);
        this.setTooltip("An item in the itemized list");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_item'] = function(block) {
    var text_item_text = block.getFieldValue('ITEM_TEXT');
    // Escape LaTeX special characters if necessary
    var code = '\\item ' + text_item_text + '\n';
    return code;
};

Blockly.Blocks['latex_itemize_list'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Itemize");
        this.appendStatementInput("ITEMS")
            .setCheck("latex_item")
            .appendField("Items");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(260);
        this.setTooltip("Container for an itemized list");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_itemize_list'] = function(block) {
    var statements_items = Blockly.JavaScript.statementToCode(block, 'ITEMS');
    var code = '\\begin{itemize}\n' + statements_items + '\\end{itemize}\n';
    return code;
};

Blockly.Blocks['latex_enumerate_list'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Enumerate");
        this.appendStatementInput("ITEMS")
            .setCheck("latex_item")
            .appendField("Items");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(260);
        this.setTooltip("Container for an enumerated list");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_enumerate_list'] = function(block) {
    var statements_items = Blockly.JavaScript.statementToCode(block, 'ITEMS');
    var code = '\\begin{enumerate}\n' + statements_items + '\\end{enumerate}\n';
    return code;
};

Blockly.Blocks['latex_alph_list'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Alphabetical List");
        this.appendStatementInput("ITEMS")
            .setCheck("latex_item")
            .appendField("Items");
        this.setPreviousStatement(true, null); // Allows connection to a block above
        this.setNextStatement(true, null); // Allows connection to a block below
        this.setColour(260);
        this.setTooltip("Creates an alphabetical list (a, b, c, ...)");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_alph_list'] = function(block) {
    var items = Blockly.JavaScript.statementToCode(block, 'ITEMS');
    // Prepend \renewcommand or other setup if needed here
    var code = '\\begin{enumerate}[(a)]\n' + items + '\\end{enumerate}\n';
    return code;
};

Blockly.Blocks['latex_description_list'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Description List");
        this.appendStatementInput("ITEMS")
            .setCheck("latex_description_item")
            .appendField("Items");
        this.setPreviousStatement(true, null); // Connects above
        this.setNextStatement(true, null); // Connects below
        this.setColour(260);
        this.setTooltip("Container for a description list");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_description_list'] = function(block) {
    var items_code = Blockly.JavaScript.statementToCode(block, 'ITEMS');
    var code = '\\begin{description}\n' + items_code + '\\end{description}\n';
    return code;
};

Blockly.Blocks['latex_description_item'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Item");
        this.appendDummyInput()
            .appendField("Term")
            .appendField(new Blockly.FieldTextInput("Enter term here"), "TERM");
        this.appendDummyInput()
            .appendField("Description")
            .appendField(new Blockly.FieldTextInput("Enter description here"), "DESCRIPTION");
        this.setPreviousStatement(true, "latex_description_item");
        this.setNextStatement(true, "latex_description_item");
        this.setColour(260);
        this.setTooltip("An item in the description list with a term and its description.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_description_item'] = function(block) {
    var term = block.getFieldValue('TERM');
    var description = block.getFieldValue('DESCRIPTION');
    // Escape LaTeX special characters in term and description if necessary
    var code = '\\item[' + term + '] ' + description + '\n';
    return code;
};


//IMAGE BLOCKS//

Blockly.fieldRegistry.register('field_image_upload', class extends Blockly.Field {
    constructor(value, options) {
        super(value);
        this.options_ = options || {};
    }

    showEditor_() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'; // Accept only image files
        input.style.display = 'none'; // Hide the file input
        document.body.appendChild(input);

        input.addEventListener('change', (event) => {
            // Handle the file selection
            const file = event.target.files[0];
            if (file) {
                // Assuming you have a mechanism to upload the file and get a URL
                this.uploadImage(file).then((imageUrl) => {
                    this.setValue(imageUrl);
                    this.forceRerender();
                }).catch(console.error);
            }
        });

        input.click();
        document.body.removeChild(input);
    }

    uploadImage(file) {
        // Placeholder for uploading logic
        // This should return a Promise that resolves with the URL of the uploaded image
        return Promise.resolve('https://example.com/path/to/uploaded/image.jpg');
    }
});

Blockly.Blocks['latex_includegraphics'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Include Image");
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable('Upload Image', 'field_image_upload'), 'IMAGE');
        // Additional inputs for width, height, caption as needed
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Includes an image in the document");
        this.setHelpUrl("");
    }
};
