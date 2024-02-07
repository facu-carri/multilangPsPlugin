const { executeNoContext } = require('./execute')
const { app, constants, action } = require('photoshop')

const batchPlay = async (command, options = {}) => { return await action.batchPlay(command, options) }

function setVisibility(layer, val) {
    layer.visible = val
}

async function translate(layer, x, y) {
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
    //console.log("Layer:", layer.name, "Ref:", ref.name, "x:", offset_x, "y:", offset_y)
    await executeNoContext(translate, layer, offset_x, offset_y)
}

async function resetPosition(layer) {
    await executeNoContext(translate, layer, layer.bounds.left * -1, layer.bounds.top * -1)
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
        batchPlay(
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

function select(layer) {
    const command = [{"_obj":"select","_target":[{"_name":layer.name,"_ref":"layer"}],"layerID":[layer.id],"makeVisible":false}]
    batchPlay(command, { synchronousExecution: true })
}

function getWidth(layer) {
    return layer.bounds.width
}

function getHeight(layer) {
    return layer.bounds.height
}

async function getIndex(layer) {
    const command = [{
        _obj: "get",
        _target: [
            {_property: "itemIndex"},
            {_ref: "layer",_id: layer.id},
            {_ref: "document",_id: app.activeDocument.id}
        ],
        _options: {dialogOptions: "dontDisplay"}
    }]
    return (await batchPlay(command))[0].itemIndex
}

async function duplicateEffects(ref, to) {
    const index = await getIndex(to)
    console.log(index)
    const command = [
    {
        _obj: "duplicate",
        _target: [
            {_ref: "layerEffects"},
            {_ref: "layer",_name: ref.name}
        ],
        to: {_ref: "layer",_index: index},
        _options: {dialogOptions: "dontDisplay"}
    }]
    await batchPlay(command, { synchronousExecution: true })
}

module.exports = { setVisibility, translate, translateByRef, resetPosition, deleteLayer, createGroup, moveToGroup, collapseFolder, getWidth, getHeight, select, batchPlay, duplicateEffects, getIndex }