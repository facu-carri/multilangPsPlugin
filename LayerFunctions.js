const { executeNoContext } = require('./execute')
const { app, constants, action } = require('photoshop')

function setVisibility(layer, val) {
    layer.visible = val
}

async function trasnlate(layer, x, y) {
    await layer.translate(x, y)
}

async function translateByRef(layer, ref){
    const refBounds = ref.bounds
    let offset_x = refBounds.left + refBounds.width + 10
    let offset_y = refBounds.top
    if (offset_x + layer.bounds.width > doc.width) {
        offset_x = layer.bounds.left * -1
        offset_y += layer.bounds.height + 15
    }
    console.log("Layer:", layer.name, "Ref:", ref.name, "x:", offset_x, "y:", offset_y)
    await executeNoContext(trasnlate, layer, offset_x, offset_y)
}

async function resetPosition(layer) {
    await executeNoContext(trasnlate, layer, layer.bounds.left * -1, layer.bounds.top * -1)
}

async function deleteLayer(layer){
    layer.delete()
}

async function createGroup(name) {
    return await app.activeDocument.createLayerGroup({ name: name })
}

async function moveToGroup(layer, group) {
    await layer.move(group, constants.ElementPlacement.PLACEINSIDE)
}

const collapseFolder = (expand = false, recursive = false) => {
    try {
        action.batchPlay(
        [{
            _obj: "set",
            _target: {_ref: [{ _property: "layerSectionExpanded" },{_ref: "layer",_enum: "ordinal",_value: "targetEnum"}]},
            to: expand,
            recursive,
            _options: { dialogOptions: "dontDisplay" },
        }],
        { synchronousExecution: true })
    }
    catch (e) { console.error(e.message) }
}

async function getBounds(docID, layerID) {
    return await action.batchPlay(
        [{
            _obj: "get",
            _target: [
                {_property: "bounds"},
                {_ref: "layer",_id: layerID},
                {_ref: "document",_id: docID}
            ],
            _options: {dialogOptions: "dontDisplay"}
        }], {}
    )
}

function getWidth(layer) {
    return layer.bounds.width
}

function getHeight(layer) {
    return layer.bounds.height
}

module.exports = { setVisibility, trasnlate, translateByRef, resetPosition, deleteLayer, createGroup, moveToGroup, collapseFolder, getWidth, getHeight, getBounds }