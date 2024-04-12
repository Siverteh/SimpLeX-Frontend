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

export function shouldAutosave(event, workspace) {
    const block = workspace.getBlockById(event.blockId);
    if (!block) return false; // Early exit if block does not exist (safety check)

    const rootBlock = block.getRootBlock();
    const isDocumentStartAffected = rootBlock.type === 'document_start_block';

    switch(event.type) {
        case Blockly.Events.BLOCK_CREATE:
        case Blockly.Events.BLOCK_DELETE:
            // Trigger autosave if the block is connected to the document start block
            return isDocumentStartAffected;
        case Blockly.Events.BLOCK_CHANGE:
            // Always autosave on changes (text changes, dropdowns, etc.)
            return true;
        case Blockly.Events.BLOCK_MOVE:
            // Autosave on moves affecting connection to/from document start block
            const wasConnected = !!event.oldParentId;
            const isConnected = !!event.newParentId && isDocumentStartAffected;
            return wasConnected || isConnected;
        default:
            return false;
    }
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

