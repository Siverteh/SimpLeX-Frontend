//CONFIGURATION BLOCKS//

// Document start block
Blockly.Blocks['document_start_block'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Document Start Block");
        this.appendStatementInput("CONFIG")
            .setCheck("ConfigBlocks") // Only accept blocks of type "ConfigBlocks"
            .appendField("Configurations (optional)");
        this.setNextStatement(true, null); // Allows connection to blocks below
        this.setColour(60);
        this.setTooltip("Start of your LaTeX document. Configure document settings.");
        this.setHelpUrl("");

        this.customContextMenu = function(options) {
            for (let i = options.length - 1; i >= 0; i--) {
                if (options[i].text === 'Duplicate') {
                    // Remove or disable the Duplicate option
                    options.splice(i, 1); // This removes the option
                    // Alternatively, you could disable the option by setting a flag
                    // options[i].enabled = false;
                }
            }
        }
    }
};

Blockly.JavaScript['document_start_block'] = function(block) {
    var packages = [
        "\\usepackage{amsmath}",
        "\\usepackage{amsfonts}",
        "\\usepackage{amssymb}",
        "\\usepackage{graphicx}",
        "\\usepackage[a4paper, margin=2cm]{geometry}",
        "\\usepackage[bookmarks=false,hidelinks]{hyperref}"
    ].join('\n');

    // Generate code for blocks placed within the "CONFIG" input
    var configCode = Blockly.JavaScript.statementToCode(block, 'CONFIG').trim();

    // Extract document class and other configurations
    var docType = 'article'; // Default to article
    var classOptions = 'a4paper, twoside, 12pt'; // Default class options
    if(configCode) {
        var matches = configCode.match(/\[(.*?)\]/);
        if(matches) {
            docType = matches[1].split(',')[0].trim(); // Extract document type from configuration
            classOptions = matches[1]; // Use the entire configuration string
        }
    }

    var code = `\\documentclass[${classOptions}]{${docType}}\n${packages}\n\\begin{document}\n\\pagenumbering{roman}\n${configCode.replace(/\[.*?\]/, '')}\n\\pagenumbering{arabic}\\leavevmode\n`;
    return code;
};


Blockly.Blocks['document_configuration'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Document Configuration");
        this.appendDummyInput()
            .appendField("Document Type")
            .appendField(new Blockly.FieldDropdown([
                ["Article", "article"],
                ["Report", "report"],
                ["Book", "book"],
                ["Beamer", "beamer"]
            ]), "DOCTYPE");
        this.appendDummyInput()
            .appendField("Paper Size")
            .appendField(new Blockly.FieldDropdown([
                ["A4", "a4paper"],
                ["Letter", "letterpaper"],
                ["A5", "a5paper"]
            ]), "PAPERSIZE");
        this.appendDummyInput()
            .appendField("Orientation")
            .appendField(new Blockly.FieldDropdown([
                ["Portrait", "portrait"],
                ["Landscape", "landscape"]
            ]), "ORIENTATION");
        this.appendDummyInput()
            .appendField("Margin")
            .appendField(new Blockly.FieldDropdown([
                ["1cm", "1cm"],
                ["2cm", "2cm"],
                ["3cm", "3cm"]
            ]), "MARGIN");
        this.appendDummyInput()
            .appendField("Font Size")
            .appendField(new Blockly.FieldDropdown([
                ["10pt", "10pt"],
                ["11pt", "11pt"],
                ["12pt", "12pt"]
            ]), "FONTSIZE");
        this.appendDummyInput()
            .appendField("Columns")
            .appendField(new Blockly.FieldDropdown([
                ["One", "onecolumn"],
                ["Two", "twocolumn"]
            ]), "COLUMNS");
        this.setPreviousStatement(true, "ConfigBlocks");
        this.setNextStatement(true, "ConfigBlocks");
        this.setColour(60);
        this.setTooltip("Configures document settings like type, size, orientation, and more.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['document_configuration'] = function(block) {
    var docType = block.getFieldValue('DOCTYPE');
    var paperSize = block.getFieldValue('PAPERSIZE');
    var orientation = block.getFieldValue('ORIENTATION');
    var margin = block.getFieldValue('MARGIN');
    var fontSize = block.getFieldValue('FONTSIZE');
    var columns = block.getFieldValue('COLUMNS');

    var code = `[${docType}, ${paperSize}, ${orientation}, ${margin}, ${fontSize}, ${columns}]`;
    return code;
};


// Table of Contents Block with clear page option
Blockly.Blocks['table_of_contents'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Add Table of Contents")
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("New page after table of contents.")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "CLEAR_PAGE");
        this.setPreviousStatement(true, "ConfigBlocks");
        this.setNextStatement(true, "ConfigBlocks");
        this.setColour(60);
        this.setTooltip("Adds a table of contents.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['table_of_contents'] = function(block) {
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\clearpage\n' : '';
    return '\\tableofcontents\n' + clearPage;
};

// List of Figures Block with clear page option
Blockly.Blocks['list_of_figures'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Add List of Figures")
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("New page after list of figures.")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "CLEAR_PAGE");
        this.setPreviousStatement(true, "ConfigBlocks");
        this.setNextStatement(true, "ConfigBlocks");
        this.setColour(60);
        this.setTooltip("Adds a list of figures.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['list_of_figures'] = function(block) {
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\clearpage\n' : '';
    return '\\listoffigures\n' + clearPage;
};

// List of Tables Block with clear page option
Blockly.Blocks['list_of_tables'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Add List of Tables")
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("New page after list of tables.")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "CLEAR_PAGE");
        this.setPreviousStatement(true, "ConfigBlocks");
        this.setNextStatement(true, "ConfigBlocks");
        this.setColour(60);
        this.setTooltip("Adds a list of tables.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['list_of_tables'] = function(block) {
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\clearpage\n' : '';
    return '\\listoftables\n' + clearPage;
};

// Add Bibliography Block with clear page option
Blockly.Blocks['add_bibliography'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Bibliography")
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Clear page")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "CLEAR_PAGE")
            .appendField(new Blockly.FieldTextInput("references"), "BIB_FILE");
        this.setPreviousStatement(true, "ConfigBlocks");
        this.setNextStatement(true, "ConfigBlocks");
        this.setColour(60);
        this.setTooltip("Adds a bibliography section.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['add_bibliography'] = function(block) {
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\clearpage\n' : '';
    var bibFile = block.getFieldValue('BIB_FILE');
    return `\\bibliography{${bibFile}}\n\\bibliographystyle{plain}\n`;
};


//DOCUMENT STRUCTURE BLOCKS//

Blockly.Blocks['chapter'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Chapter")
            .appendField(new Blockly.FieldTextInput("Enter chapter name here"), "chapter");
        this.appendStatementInput("CONTENT")
            .setCheck(null)
            .appendField("Content");
        this.setPreviousStatement(true, ['document_start_block', 'chapter']);
        this.setNextStatement(true, 'chapter');
        this.setColour(230);
        this.setTooltip("Block for creating a chapter in LaTeX");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['chapter'] = function(block) {
    var text_section_name = block.getFieldValue('chapter');
    var statements_content = Blockly.JavaScript.statementToCode(block, 'CONTENT');
    // This now returns the section code with nested content
    return '\\chapter{' + text_section_name + '}\n' + statements_content;
};

Blockly.Blocks['section'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Section")
            .appendField(new Blockly.FieldTextInput("Enter section name here"), "section");
        this.appendStatementInput("CONTENT")
            .setCheck(null)
            .appendField("Content");
        this.setPreviousStatement(true, ['document_start_block', 'section']);
        this.setNextStatement(true, 'section');
        this.setColour(220);
        this.setTooltip("Block for creating a section in LaTeX");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['section'] = function(block) {
    var text_section_name = block.getFieldValue('section');
    var statements_content = Blockly.JavaScript.statementToCode(block, 'CONTENT');
    // This now returns the section code with nested content
    return '\\section{' + text_section_name + '}\n' + statements_content;
};

Blockly.Blocks['subsection'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Subsection")
            .appendField(new Blockly.FieldTextInput("Enter subsection name here"), "subsection");
        this.appendStatementInput("CONTENT")
            .setCheck(null)
            .appendField("Content");
        this.setPreviousStatement(true, 'subsection'); // Connects to a block above
        this.setNextStatement(true, 'subsection'); // Allows connecting to a block below
        this.setColour(210);
        this.setTooltip("Block for creating a subsection in LaTeX");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['subsection'] = function(block) {
    var text_subsection_name = block.getFieldValue('subsection');
    var statements_content = Blockly.JavaScript.statementToCode(block, 'CONTENT');
    // This now returns the subsection code with nested content
    return '\\subsection{' + text_subsection_name + '}\n' + statements_content;
};

Blockly.Blocks['subsubsection'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Subsubsection")
            .appendField(new Blockly.FieldTextInput("Enter subsubsection name here"), "subsubsection");
        this.appendStatementInput("CONTENT")
            .setCheck(null)
            .appendField("Content");
        this.setPreviousStatement(true, 'subsubsection'); // Connects to a block above
        this.setNextStatement(true, 'subsubsection'); // Allows connecting to a block below
        this.setColour(200);
        this.setTooltip("Block for creating a subsubsection in LaTeX");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['subsubsection'] = function(block) {
    var text_subsubsection_name = block.getFieldValue('subsubsection');
    var statements_content = Blockly.JavaScript.statementToCode(block, 'CONTENT');
    // This now returns the subsubsection code with nested content
    return '\\subsubsection{' + text_subsubsection_name + '}\n' + statements_content;
};

Blockly.Blocks['new_page'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("New page");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Insert a new page in the document");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['new_page'] = function(block) {
    return '\\newpage\n';
}

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
