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