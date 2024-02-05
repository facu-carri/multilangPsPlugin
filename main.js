const { entrypoints } = require("uxp");
const { app, constants } = require('photoshop')
const { translateByRef, resetPosition, setVisibility, deleteLayer, createGroup, moveToGroup, collapseFolder, getWidth, getHeight, getBounds } = require('./LayerFunctions.js')
const { changeText } = require('./TextLayerFunctions.js')
const { executeNoContext } = require('./execute.js')
const languajes = require('./languajesChars.json');

const TEMPLATE_LAYER = "template"
const doc = app.activeDocument

showAlert = () => alert("This is an alert message")

entrypoints.setup({
  commands: {showAlert},
  panels: {vanilla:{show(node){}}}
})

app.preferences.unitsAndRulers = constants.RulerUnits.PIXELS

window['doc'] = doc
window['app'] = app

//Alphabet

async function createCharLayer(ref, template, name){
  const charLayer = await template.duplicate(ref, constants.ElementPlacement.PLACEATBEGINNING, name)
  charLayer.visible = true
  return charLayer
}

async function createAlphabeth(template, chars, group){
  let layerRef = null

  for (let i = 0; i < chars.length; i++){
    const char = chars.at(i)
    const layerExist = doc.layers.getByName(char)
    if (!!layerExist) {
      layerRef = layerExist
      continue
    }
    const charLayer = await executeNoContext(createCharLayer, doc, template, char)
    await executeNoContext(changeText, charLayer, char)
    await resetPosition(charLayer)

    if (layerRef) await translateByRef(charLayer, layerRef)
    layerRef = charLayer
    
    await executeNoContext(moveToGroup, charLayer, group)
  }
}

function cleanDuplicatedChars(e) {
  return [...new Set(e)].sort().join("")
}

async function calculateBounds(template, chars) {
  await executeNoContext(setVisibility, template, true)
  for (let i = 0; i < 5; i++){
    //setTimeout(async () => await changeTest(template, chars.at(i)), 3000 * (i + 1))
  }
}

function checkMax(layer, maxObj) {
  const width = getWidth(layer)
  const height = getHeight(layer)
  if (width > maxObj.width) {
    maxObj.width = width
  }
  if (height > maxObj.height) {
    maxObj.height = height
  }
  console.log(layer.name, width, height)
}

function getMaxDims(group) {
  const max = {
    width: 0,
    height: 0
  }
  group.layers.forEach(layer => {if(layer.visible) checkMax(layer, max)})
  console.log(max)
}

async function initCharLayers() {
  const template = doc.layers.getByName(TEMPLATE_LAYER)

  await executeNoContext(setVisibility, template, false)
  for (let lang in languajes) {
    const chars = cleanDuplicatedChars(languajes[lang])
    const group = await executeNoContext(createGroup, lang)
    await executeNoContext(collapseFolder, false, true)
    await createAlphabeth(template, chars, group)
    getMaxDims(group)
  }
}

async function deleteLayers() {
  const layers = doc.layers
  for (let i = 0; i < layers.length; i++){
    const layer = layers[i]
    if (layer.name != TEMPLATE_LAYER) await executeNoContext(deleteLayer, layer)
  }
}

async function resize() {
  await executeNoContext(async (w,h) => await doc.resizeCanvas(w,h), 800, 800)
}

async function test() {
  const template = doc.layers.getByName(TEMPLATE_LAYER)
  const group = await executeNoContext(createGroup, 'en')
  const layer = await executeNoContext(createCharLayer, doc, template, 'test')
  await executeNoContext(moveToGroup, layer, group)
}

document.getElementById("btnPopulate").addEventListener("click", initCharLayers)
document.getElementById("btnDelete").addEventListener("click", deleteLayers)
document.getElementById("btnResize").addEventListener("click", resize)
document.getElementById("btnGroup").addEventListener("click", test)