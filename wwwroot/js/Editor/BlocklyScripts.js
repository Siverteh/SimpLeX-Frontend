export function initializeBlockly() {
    const toolbox = document.getElementById('toolbox');
    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
        scrollbars: true,
        trashcan: true,
        move: {
            scrollbars: true,
            drag: true,
            wheel: true
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        }
    });

    Blockly.JavaScript.init(workspace);
    
    return workspace;
}

export function shouldAutosave(event) {
    // Events that indicate a meaningful change in the workspace content
    const meaningfulChangeEvents = [
        Blockly.Events.BLOCK_CREATE,
        Blockly.Events.BLOCK_CHANGE,
        Blockly.Events.BLOCK_DELETE,
        Blockly.Events.BLOCK_MOVE
    ];

    let isMeaningfulEvent = meaningfulChangeEvents.includes(event.type);

    // Handle BLOCK_MOVE events to ensure they result in a new connection or disconnection
    if (event.type === Blockly.Events.BLOCK_MOVE) {
        isMeaningfulEvent = !!event.newParentId || !!event.oldParentId;
    }

    // Handle BLOCK_CHANGE events to focus on changes to block fields
    if (event.type === Blockly.Events.BLOCK_CHANGE && event.element !== 'field') {
        isMeaningfulEvent = false;
    }

    // Specifically handle BLOCK_DELETE events to always trigger autosave
    if (event.type === Blockly.Events.BLOCK_DELETE) {
        isMeaningfulEvent = true;
    }

    return isMeaningfulEvent;
}

export function ensureDocumentStartBlockExists(workspace) {
    // Check if a document start block already exists
    const existingStartBlocks = workspace.getBlocksByType('document_start_block', false);
    if (existingStartBlocks.length === 0) {
        // No document start block found, so create one
        const startBlock = workspace.newBlock('document_start_block');
        startBlock.initSvg();
        startBlock.render();
        // Optionally, set the position of the block
        startBlock.moveBy(400, 50);
    }
}

export function compileConnectedBlocks(workspace) {
    let startBlock = workspace.getTopBlocks().find(block => block.type === 'document_start_block');
    if (!startBlock) {
        console.log('Document start block not found.');
        return '';
    }
    // Blockly handles connected blocks automatically, so you may just need to generate code for the start block.
    let code = Blockly.JavaScript.blockToCode(startBlock);
    return code;
}