Blockly.fieldRegistry.register('field_image_paste', class extends Blockly.FieldTextInput {
    constructor(text, opt_validator) {
        super(text, opt_validator);
        this.setValue("Paste an image here");  // Default text
    }

    showEditor_() {
        super.showEditor_();
        const editor = this.htmlInput_;  // Get the HTML input element
        editor.addEventListener('paste', (event) => {
            const items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (const item of items) {
                if (item.type.indexOf('image') === 0) {
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.setValue(e.target.result);  // Set the base64 string as value
                        this.forceRerender();
                    };
                    reader.readAsDataURL(blob);  // Convert image file to base64 string
                }
            }
            event.preventDefault();  // Prevent the default paste action
        });
    }
});

Blockly.Blocks['latex_figure_paste'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Include Pasted Image");
        this.appendDummyInput()
            .appendField(new Blockly.fieldRegistry.getClass('field_image_paste')("Paste image here"), "IMAGE");
        this.appendDummyInput()
            .appendField("Width (cm)")
            .appendField(new Blockly.FieldNumber(5, 0.1, 20, 0.1), "WIDTH");
        this.appendDummyInput()
            .appendField("Height (cm)")
            .appendField(new Blockly.FieldNumber(5, 0.1, 20, 0.1), "HEIGHT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Includes a pasted image in the document.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_figure_paste'] = function(block) {
    var imageUrl = block.getFieldValue('IMAGE');
    var width = block.getFieldValue('WIDTH');
    var height = block.getFieldValue('HEIGHT');
    var code = `\\includegraphics[width=${width}cm, height=${height}cm]{${imageUrl}}\n`;
    return code;
};

Blockly.fieldRegistry.register('field_image_upload', class extends Blockly.FieldTextInput {
    constructor(text, opt_validator) {
        super(text, opt_validator);
        this.setValue("Click to upload an image");  // Default text
    }

    showEditor_() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none'; // Make input invisible
        document.body.appendChild(input); // Append to ensure it is in document

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.setValue(e.target.result);  // Set the base64 string as value
                    this.forceRerender();
                };
                reader.readAsDataURL(file);  // Convert the file to a Data URL
            }
            input.remove();  // Clean up
        });

        input.click();  // Trigger the file input dialog
    }
});

Blockly.Blocks['latex_figure_upload'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Include Uploaded Image");
        this.appendDummyInput()
            .appendField(new Blockly.fieldRegistry.getClass('field_image_upload')("Click to upload image"), "IMAGE");
        this.appendDummyInput()
            .appendField("Width (cm)")
            .appendField(new Blockly.FieldNumber(5, 0.1, 20, 0.1), "WIDTH");
        this.appendDummyInput()
            .appendField("Height (cm)")
            .appendField(new Blockly.FieldNumber(5, 0.1, 20, 0.1), "HEIGHT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Includes an uploaded image in the document.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_figure_upload'] = function(block) {
    var imageUrl = block.getFieldValue('IMAGE');
    var width = block.getFieldValue('WIDTH');
    var height = block.getFieldValue('HEIGHT');
    var code = `\\includegraphics[width=${width}cm, height=${height}cm]{${imageUrl}}\n`;
    return code;
};
