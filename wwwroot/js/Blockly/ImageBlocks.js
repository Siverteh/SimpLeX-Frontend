var currentImageBlock = null; // Global reference to track the active image field
export class FieldImageButton extends Blockly.Field {
    constructor(text, validator) {
        super(text, validator);
        this.SERIALIZABLE = true;
        this.value_ = text;  // Set initial value
        this.size_ = new Blockly.utils.Size(0, 24);  // Ensure the field has a size
        this.isFieldClick_ = true;
    }

    static fromJson(options) {
        return new FieldImageButton(options['text'], options['validator']);
    }

    showEditor_() {
        currentImageBlock = this;  // Update the global reference to this block
        $('#imageGalleryModal').modal('show');
        $('#imageGalleryModal').on('hide.bs.modal', () => {
            const selectedImagePath = localStorage.getItem('selectedImagePath'); // Assuming the path gets stored here on image click
            if (selectedImagePath && currentImageBlock === this) {  // Check if this is still the active block
                this.updateSrcField(selectedImagePath);
                localStorage.removeItem('selectedImagePath'); // Clear after setting
                this.forceRerender();  // Ensure the display updates
            }
        });
    }

    updateSrcField(newValue) {
        let srcField = this.sourceBlock_.getField('SRC');
        if (srcField) {
            const oldValue = srcField.getValue();
            srcField.setValue(newValue);  // Update the value
            if (Blockly.Events.isEnabled()) {
                Blockly.Events.fire(new Blockly.Events.BlockChange(this.sourceBlock_, 'field', 'SRC', oldValue, newValue));
            }
        }
    }

    render_() {
        super.render_(); // Let Blockly do its standard rendering first

        if (!this.textElement_) {
            this.createTextElement_();  // Ensure text element exists if not already
        }
        this.textContent_.nodeValue = this.value_ || 'Select Image'; // Set the display text
        this.size_.width = this.calculateWidth(); // Recalculate the width

        // Apply style changes directly after Blockly's render
        if (this.borderRect_) {
            this.borderRect_.style.fill = '#e1e1e1';  // Light grey background
            this.borderRect_.style.stroke = '#d0d0d0';  // Grey border
            this.borderRect_.setAttribute('width', this.size_.width + Blockly.BlockSvg.SEP_SPACE_X);
        }
        if (this.textElement_) {
            this.textElement_.style.fill = '#000';  // Black text color
            this.textElement_.style.fontWeight = "bold";  // Bold text
            this.textElement_.setAttribute("x", Blockly.BlockSvg.SEP_SPACE_X / 2);  // Center the text in the button
        }
    }

    calculateWidth() {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.font = "bold 11pt Arial";  // Ensure the font is bold for width calculation
        const text = this.value_ || 'Select Image';
        const width = context.measureText(text).width;
        return Math.ceil(width + 10);  // Padding around the text
    }

    getText() {
        return 'Select Image';
    }
}

Blockly.fieldRegistry.register('field_image_button', FieldImageButton);

// Standard Image Block
Blockly.Blocks['latex_standard_image'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Standard Image");
        this.appendDummyInput()
            .appendField(new FieldImageButton("Select Image"), "SRC");
        this.appendDummyInput()
            .appendField("Width:")
            .appendField(new Blockly.FieldDropdown([
                ["Full width", "\\textwidth"],
                ["3/4 width", "0.75\\textwidth"],
                ["1/2 width", "0.5\\textwidth"],
                ["1/4 width", "0.25\\textwidth"]
            ]), "WIDTH");
        this.appendDummyInput()
            .appendField("Caption:")
            .appendField(new Blockly.FieldTextInput("Caption here"), "CAPTION");
        this.appendDummyInput()
            .appendField("Label:")
            .appendField(new Blockly.FieldTextInput("fig:label"), "LABEL");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(40);
        this.setTooltip("Includes a standard image with caption and label.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_standard_image'] = function(block) {
    var src = block.getFieldValue('SRC');
    var width = block.getFieldValue('WIDTH');
    var caption = block.getFieldValue('CAPTION');
    var label = block.getFieldValue('LABEL');
    var code = `\\begin{figure}[H]\n\\centering\n\\includegraphics[width=${width}]{/data/images/${src}}\n\\caption{${caption}}\n\\label{${label}}\n\\end{figure}\n`;
    return code;
};

// Simple Image Block
Blockly.Blocks['latex_simple_image'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Simple Image");
        this.appendDummyInput()
            .appendField(new FieldImageButton("Select Image"), "SRC");
        this.appendDummyInput()
            .appendField("Width:")
            .appendField(new Blockly.FieldDropdown([
                ["Full width", "\\textwidth"],
                ["3/4 width", "0.75\\textwidth"],
                ["1/2 width", "0.5\\textwidth"],
                ["1/4 width", "0.25\\textwidth"]
            ]), "WIDTH");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(40);
        this.setTooltip("Includes a simple image with selectable width.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_simple_image'] = function(block) {
    var src = block.getFieldValue('SRC');
    var width = block.getFieldValue('WIDTH');
    var code = `\\includegraphics[width=${width}]{/data/images/${src}}\n`;
    return code;
};

// Detailed Image Block
Blockly.Blocks['latex_detailed_image'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Detailed Image");
        this.appendDummyInput()
            .appendField(new FieldImageButton("Select Image"), "SRC");
        this.appendDummyInput()
            .appendField("Width:")
            .appendField(new Blockly.FieldTextInput("0.5\\textwidth"), "WIDTH");
        this.appendDummyInput()
            .appendField("Height:")
            .appendField(new Blockly.FieldTextInput("0.5\\textheight"), "HEIGHT");
        this.appendDummyInput()
            .appendField("Placement:")
            .appendField(new Blockly.FieldDropdown([
                ["Here", "H"],
                ["Top", "t"],
                ["Bottom", "b"],
                ["Page", "p"]
            ]), "PLACEMENT");
        this.appendDummyInput()
            .appendField("Caption:")
            .appendField(new Blockly.FieldTextInput("Caption here"), "CAPTION");
        this.appendDummyInput()
            .appendField("Label:")
            .appendField(new Blockly.FieldTextInput("fig:label"), "LABEL");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(40);
        this.setTooltip("Includes an image with detailed control over size and placement.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['latex_detailed_image'] = function(block) {
    var src = block.getFieldValue('SRC');
    var width = block.getFieldValue('WIDTH');
    var height = block.getFieldValue('HEIGHT');
    var placement = block.getFieldValue('PLACEMENT');
    var caption = block.getFieldValue('CAPTION');
    var label = block.getFieldValue('LABEL');
    var code = `\\begin{figure}[${placement}]\n\\centering\n\\includegraphics[width=${width}, height=${height}]{/data/images/${src}}\n\\caption{${caption}}\n\\label{${label}}\n\\end{figure}\n`;
    return code;
};

