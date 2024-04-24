Blockly.Blocks['latex_table'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Create Table");
        this.appendDummyInput()
            .appendField("Rows")
            .appendField(new Blockly.FieldNumber(2, 1, 10, 1), "ROWS");
        this.appendDummyInput()
            .appendField("Columns")
            .appendField(new Blockly.FieldNumber(2, 1, 10, 1), "COLS");
        this.appendDummyInput()
            .appendField("Vertical Lines")
            .appendField(new Blockly.FieldDropdown([
                ["None", "none"],
                ["Between columns", "between"],
                ["Around all columns", "around"]
            ]), "V_LINES");
        this.appendDummyInput()
            .appendField("Horizontal Lines")
            .appendField(new Blockly.FieldDropdown([
                ["None", "none"],
                ["Top and Bottom", "topbot"],
                ["After Header", "header"],
                ["Between Rows", "between"],
                ["All (Every Row)", "all"]
            ]), "H_LINES");
        this.appendDummyInput()
            .appendField("Caption:")
            .appendField(new Blockly.FieldTextInput("Table caption"), "CAPTION");
        this.appendDummyInput()
            .appendField("Label:")
            .appendField(new Blockly.FieldTextInput("tab:label"), "LABEL");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(75);
        this.setTooltip("");
        this.setHelpUrl("");

        this.updateShape_();

        this.setOnChange(function(event) {
            if (event.blockId === this.id && (event.name === 'ROWS' || event.name === 'COLS')) {
                Blockly.Events.disable();
                this.updateShape_();
                Blockly.Events.enable();
                this.render();
            }
        });
    },

    updateShape_: function() {
        // Clear all existing inputs for rows
        let i = this.inputList.length - 1;
        while (i >= 0 && this.inputList[i].name.startsWith('ROW')) {
            this.removeInput(this.inputList[i].name);
            i--;
        }

        // Re-create inputs for rows and columns
        const rows = this.getFieldValue('ROWS');
        const cols = this.getFieldValue('COLS');
        for (let r = 0; r < rows; r++) {
            let rowInput = this.appendDummyInput('ROW' + r);
            for (let c = 0; c < cols; c++) {
                rowInput.appendField(new Blockly.FieldTextInput("Value"), 'CELL' + r + '_' + c);
            }
        }

        if (this.workspace) {
            this.initSvg();
            this.render();
        }
    },

    mutationToDom: function() {
        var container = document.createElement('mutation');
        container.setAttribute('rows', this.getFieldValue('ROWS'));
        container.setAttribute('cols', this.getFieldValue('COLS'));
        return container;
    },

    domToMutation: function(xmlElement) {
        var rows = parseInt(xmlElement.getAttribute('rows'), 10);
        var cols = parseInt(xmlElement.getAttribute('cols'), 10);
        this.getField('ROWS').setValue(rows);
        this.getField('COLS').setValue(cols);
        this.updateShape_();
    },
};

Blockly.JavaScript['latex_table'] = function(block) {
    const rows = parseInt(block.getFieldValue('ROWS'));
    const cols = parseInt(block.getFieldValue('COLS'));
    const vLinesOption = block.getFieldValue('V_LINES');
    const hLinesOption = block.getFieldValue('H_LINES');
    const caption = block.getFieldValue('CAPTION');
    const label = block.getFieldValue('LABEL');

    // Determine vertical line options
    let colDescriptor = '';
    if (vLinesOption === 'between') {
        colDescriptor = Array(cols).fill('c').join('|');
    } else if (vLinesOption === 'around') {
        colDescriptor = '|' + Array(cols).fill('c').join('|') + '|';
    } else {
        colDescriptor = Array(cols).fill('c').join('');
    }

    let code = `\\begin{table}[h]\n\\centering\n\\begin{tabular}{${colDescriptor}}\n`;
    if (hLinesOption === 'topbot' || hLinesOption === 'all') {
        code += "\\hline\n";
    }
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            code += block.getFieldValue('CELL' + r + '_' + c) + (c < cols - 1 ? ' & ' : '');
        }
        code += '\\\\\n';
        if (hLinesOption === 'all' || (hLinesOption === 'between' && r < rows - 1) || (hLinesOption === 'header' && r == 0)) {
            code += "\\hline\n";
        }
    }
    if (hLinesOption === 'topbot') {
        code += "\\hline\n";
    }
    code += `\\end{tabular}\n\\caption{${caption}}\n\\label{${label}}\n\\end{table}\n`;
    return code;
};



