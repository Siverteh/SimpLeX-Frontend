import {globalCitations} from "../Editor/CitationScripts.js";

import {FieldRichTextEditor} from "./TextBlocks.js";

var globalDocType = 'article';

Blockly.Blocks['document_start_block'] = {
    init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Document Start Block");

        this.appendValueInput("FRONTPAGE")
            .setCheck("FrontPage") // Only accept blocks of type "FrontPage"
            .appendField("Front Page (optional) -->");

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
            .appendField("Font Size")
            .appendField(new Blockly.FieldDropdown([
                ["10pt", "10pt"],
                ["11pt", "11pt"],
                ["12pt", "12pt"]
            ]), "FONTSIZE");

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
    globalDocType = block.getFieldValue('DOCTYPE');
    var paperSize = block.getFieldValue('PAPERSIZE');
    var fontSize = block.getFieldValue('FONTSIZE');

    var packages = [
        "\\usepackage{amsmath}",
        "\\usepackage{amsfonts}",
        "\\usepackage{amssymb}",
        "\\usepackage{graphicx}",
        `\\usepackage[${paperSize}, margin=2cm]{geometry}`,
        "\\usepackage[bookmarks=false,hidelinks]{hyperref}",
        "\\usepackage{float}",
        "\\usepackage{subcaption}",
        "\\usepackage[backend=biber]{biblatex}",
        "\\usepackage{transparent}",
        "\\usepackage[table]{xcolor}",
        "\\usepackage{eso-pic}",
        "\\usepackage{psfrag}",
        "\\usepackage{authblk}",
        "\\usepackage{array}",
        "\\usepackage{svg}",
        "\\usepackage{listings}",
        "\\usepackage[newfloat]{minted}"
    ].join('\n');

    var frontPageCode = Blockly.JavaScript.valueToCode(block, 'FRONTPAGE', Blockly.JavaScript.ORDER_ATOMIC) || '';
    var configCode = Blockly.JavaScript.statementToCode(block, 'CONFIG').trim();

    // Starting the document class setup
    var docSetup = `\\documentclass[a4paper, ${fontSize}]{${globalDocType}}\n${packages}\\setlength{\\parindent}{0pt}\n${globalCitations}\n`;

    // Begin document environment
    var beginDocument = `\\begin{document}\n\\pagestyle{empty}\n${frontPageCode}\n\\clearpage\n\\pagenumbering{gobble}\n`;

    // Applying Roman numerals for preliminaries
    var preliminaries = `\\pagenumbering{roman}\n${configCode}\n`;

    // Switch to Arabic numerals for the main content
    var mainContentSetup = `\\pagestyle{plain}\n\\clearpage\n\\pagenumbering{arabic}\n`;

    return docSetup + beginDocument + preliminaries + mainContentSetup;
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
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\cleardoublepage' : '';
    return `\\tableofcontents${clearPage}\n`;
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
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\clearpage' : '';
    var tocLevel = (globalDocType === 'report' || globalDocType === 'book') ? 'chapter' : 'section';
    return `\\listoffigures\n\\addcontentsline{toc}{${tocLevel}}{List of Figures}\n${clearPage}\n\\textcolor{white}{.}\n\\thispagestyle{empty}\n\\newpage\n`;
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
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\clearpage' : '';
    var tocLevel = (globalDocType === 'report' || globalDocType === 'book') ? 'chapter' : 'section';
    return `\\listoftables\n\\addcontentsline{toc}{${tocLevel}}{List of Tables}\n${clearPage}\n\\textcolor{white}{.}\n\\thispagestyle{empty}\n\\newpage\n`;
};

Blockly.Blocks['abstract_page_block'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Add Abstract Page");
        this.appendDummyInput()
            .appendField(new FieldRichTextEditor("Enter Abstract here"), "ABSTRACT_TEXT");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("New page after abstract.")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "CLEAR_PAGE");
        this.setPreviousStatement(true, "ConfigBlocks");
        this.setNextStatement(true, "ConfigBlocks");
        this.setColour(30);
        this.setTooltip("Creates an abstract page for reports or articles.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['abstract_page_block'] = function(block) {
    var abstractText = block.getFieldValue("ABSTRACT_TEXT")
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\clearpage\n' : '';
    var tocLevel = (globalDocType === 'report' || globalDocType === 'book') ? 'chapter' : 'section';
    var code = `\\ifthenelse{\\equal{${globalDocType}}{report}}{\\chapter*{Abstract}}{\\section*{Abstract}}\n${abstractText}\n\\addcontentsline{toc}{${tocLevel}}{Abstract}\n${clearPage}\n`;
    return code;
};

Blockly.Blocks['acknowledgements_page_block'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Add Acknowledgements Page");
        this.appendDummyInput()
            .appendField(new FieldRichTextEditor("Enter Acknowledgements here"), "ACKNOWLEDGEMENTS_TEXT");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("New page after acknowledgements.")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "CLEAR_PAGE");
        this.setPreviousStatement(true, "ConfigBlocks");
        this.setNextStatement(true, "ConfigBlocks");
        this.setColour(30);
        this.setTooltip("Creates an acknowledgements page for reports or articles.");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['acknowledgements_page_block'] = function(block) {
    var abstractText = block.getFieldValue("ACKNOWLEDGEMENTS_TEXT")
    var clearPage = block.getFieldValue('CLEAR_PAGE') === 'TRUE' ? '\\clearpage\n' : '';
    var tocLevel = (globalDocType === 'report' || globalDocType === 'book') ? 'chapter' : 'section';
    var code = `\\ifthenelse{\\equal{${globalDocType}}{report}}{\\chapter*{Acknowledgements}}{\\section*{Acknowledgements}}\n${abstractText}\n\\addcontentsline{toc}{${tocLevel}}{Acknowledgements}\n${clearPage}\n`;
    return code;
};


