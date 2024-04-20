import {globalCitations} from "../Editor/CitationScripts.js";

Blockly.Blocks['document_start_block'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Document Start Block");

        this.appendValueInput("FRONTPAGE")
            .setCheck("FrontPage") // Only accept blocks of type "FrontPage"
            .appendField("Front Page (optional) -->");
        
        this.appendStatementInput("CONFIG")
            .setCheck("ConfigBlocks") // Only accept blocks of type "ConfigBlocks"
            .appendField("Preliminaries (optional) -->");

        this.setNextStatement(true, null); // Allows connection to blocks below
        this.setColour(60);
        this.setTooltip("Start of your LaTeX document. Configure document settings.");
        this.setHelpUrl("");

        this.customContextMenu = function(options) {
            for (let i = options.length - 1; i >= 0; i--) {
                if (options[i].text === 'Duplicate') {
                    options.splice(i, 1); // Remove the Duplicate option
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
        "\\usepackage[bookmarks=false,hidelinks]{hyperref}",
        "\\usepackage{float}",
        "\\usepackage{subcaption}",
        "\\usepackage[backend=biber]{biblatex}",
        "\\usepackage{transparent}",
        "\\usepackage[table]{xcolor}",
        "\\usepackage{eso-pic}",
        "\\usepackage{psfrag}",
        "\\usepackage{authblk}",
        "\\usepackage[utf8]{inputenc}",
        "\\usepackage[T1]{fontenc}",
        "\\usepackage{array}",
        "\\usepackage{geometry}",
        "\\usepackage{svg}"
    ].join('\n');

    var frontPageCode = Blockly.JavaScript.valueToCode(block, 'FRONTPAGE', Blockly.JavaScript.ORDER_ATOMIC) || '';
    var configCode = Blockly.JavaScript.statementToCode(block, 'CONFIG').trim();

    var classOptions = 'a4paper, twoside, 11pt';  // default class options
    var docType = 'article';  // default document type

    return `\\documentclass[${classOptions}]{${docType}}\n${packages}\n${globalCitations}\n\\begin{document}\n\\pagestyle{empty}\n${frontPageCode}\n${configCode.replace(/\[.*?\]/, '')}\n\\pagestyle{plain}\n\\pagenumbering{arabic}\\leavevmode\n`;
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
        this.setColour(30);
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
        this.setColour(30);
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
        this.setColour(30);
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
        this.setColour(30);
        this.setTooltip("Adds a list of tables.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['list_of_tables'] = function(block) {
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\clearpage\n' : '';
    return '\\listoftables\n' + clearPage;
};
