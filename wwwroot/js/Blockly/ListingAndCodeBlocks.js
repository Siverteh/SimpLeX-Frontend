class FieldCodeTextInput extends Blockly.Field {
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

Blockly.fieldRegistry.register('field_code_text_input', FieldCodeTextInput);

Blockly.Blocks['latex_code_listing'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Listings Code Listing");

        this.appendDummyInput()
            .appendField(new FieldCodeTextInput("Paste your code here..."), "CODE");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(300);
        this.setTooltip("Inserts formatted code listing for LaTeX.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_code_listing'] = function(block) {
    var codeText = block.getFieldValue('CODE');
    var code = `\\begin{lstlisting}\n${codeText}\n\\end{lstlisting}\n`;
    return code;
};

Blockly.Blocks['latex_minted_code'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Minted Code Listing");

        this.appendDummyInput()
            .appendField("Language:")
            .appendField(new Blockly.FieldDropdown([
                ["Text", "text"],
                ["Python", "python"],
                ["C/C++", "cpp"],
                ["JavaScript", "javascript"],
                ["HTML", "html"],
                ["Bash", "bash"],
                // Add more languages as needed
            ]), "LANGUAGE");

        this.appendDummyInput()
            .appendField(new FieldCodeTextInput("Paste your code here..."), "CODE");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(300);
        this.setTooltip("Inserts formatted code listing using the minted package.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_minted_code'] = function(block) {
    var language = block.getFieldValue('LANGUAGE');
    var codeText = block.getFieldValue('CODE');
    var code = `\\begin{minted}[framesep=2mm, baselinestretch=1.2, fontsize=\\normalsize, linenos, breaklines, bgcolor=gray!20]{${language}}\n${codeText}\n\\end{minted}\n`;
    return code;
};