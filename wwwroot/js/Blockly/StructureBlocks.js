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