Blockly.Blocks['latex_figure'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Include Image");
        this.appendDummyInput()
            .appendField("Paste image URL or local path:")
            .appendField(new Blockly.FieldTextInput("https://example.com/image.png"), "SRC");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Includes an image in the document using ConTeXt. Supports both URLs and local paths.");
        this.setHelpUrl("http://wiki.contextgarden.net/Command/externalfigure");
    }
};

Blockly.JavaScript['latex_figure'] = function(block) {
    var src = block.getFieldValue('SRC'); // Get the value from the text input field
    // Generate ConTeXt code for including an external figure
    var code = `\\startfigure\n\\externalfigure[${src}]\n\\stopfigure\n`;
    return code;
};

