const { entrypoints } = require("uxp")
const fs = require('uxp').storage.localFileSystem
const types = require('uxp').storage.types
const { app, constants } = require('photoshop')
const { resetPosition, setVisibility, deleteLayer, createGroup, moveToGroup, collapseFolder, getWidth, getHeight, trasnlate, select, translate, batchPlay, duplicateEffects, getIndex } = require('./LayerFunctions.js')
const { changeText, getStyle, setStyle, duplicateStyles } = require('./TextLayerFunctions.js')
const { executeNoContext } = require('./execute.js')
const languajes = require('./languajesChars.json')

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
  for (let i = 0; i < chars.length; i++){
    const char = chars.at(i)
    const charLayer = await executeNoContext(createCharLayer, doc, template, char)

    await executeNoContext(changeText, charLayer, char)
    await executeNoContext(moveToGroup, charLayer, group)
  }
}

function getMaxDims(group) {
  const max = {width: 0,height: 0}
  group.layers.forEach(layer => checkMax(layer, max))
  return max
}

async function organizateAlphabeth(group) {
  const max = getMaxDims(group)
  const groupLen = group.layers.length
  const rowElemQty = Math.round(Math.sqrt(groupLen)) + 1
  const rows = Math.floor((groupLen- 1) / rowElemQty) + 1

  console.log(rowElemQty, rows)

  await executeNoContext(resizeCanvas, max.width * rowElemQty, max.height * rows)

  for (let i = 0; i < groupLen; i++){
    const layer = group.layers[i]
    const row = i % rowElemQty
    const column = Math.floor(i / rowElemQty)

    await executeNoContext(select, layer)
    await executeNoContext(resetPosition, layer)
    await executeNoContext(translate, layer, max.width * row, max.height * column)
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
}

async function resizeCanvas(width, height) {
  await doc.resizeCanvas(width,height)
}

async function exportAlphabeth(name) {
  const token = localStorage.getItem('token')
  const folder = await fs.getEntryForPersistentToken(token)
  const file = await folder.createFile(`${name}.png`, { overwrite: true })
  await doc.saveAs.png(file)
}

async function saveDoc() {
  await doc.save()
}

async function setToken() {
  const basepath = window.path.resolve()
  const output = window.path.join(basepath, 'output')
  let folder
  try {
    folder = await fs.getEntryWithUrl(output)
  }
  catch (err) {
    folder = await fs.createEntryWithUrl(output, { type: types.folder, overwrite: true })
  }
  const token = await fs.createPersistentToken(folder)
  localStorage.setItem('token', token)
}

function cleanDuplicatedChars(e) {
  return [...new Set(e)].sort().join("")
}

function logTime(txt) {
  const time = new Date()
  console.log(`${txt} Time -> ${time.getHours()}:${time.getMinutes()}`)
}

async function initCharLayers() {
  const template = doc.layers.getByName(TEMPLATE_LAYER)

  await setToken()
  await executeNoContext(setVisibility, template, false)

  for (let lang in languajes) {
    const chars = cleanDuplicatedChars(languajes[lang])
    const group = await executeNoContext(createGroup, lang)

    await createAlphabeth(template, chars, group)
    await organizateAlphabeth(group)
    await executeNoContext(exportAlphabeth, group.name)
    await executeNoContext(setVisibility, group, false)
    await executeNoContext(select, template)
  }
  await executeNoContext(saveDoc)
}

async function deleteLayers() {
  const layers = doc.layers
  for (let i = 0; i < layers.length; i++){
    const layer = layers[i]
    if (layer.name != TEMPLATE_LAYER) await executeNoContext(deleteLayer, layer)
  }
}

async function forceResize() {
  await executeNoContext(resizeCanvas, 800, 800)
}

async function editGroups() {
  const template = doc.layers.getByName(TEMPLATE_LAYER)
  const docLayers = doc.layers

  for (let i = 0; i < docLayers.length; i++){
    const layer = docLayers[i]
    if (layer.kind == constants.LayerKind.GROUP && layer.visible) {
      const groupLayers = layer.layers
      for (let j = 0; j < groupLayers.length; j++){
        const groupLayer = groupLayers[j]
        console.log(groupLayer.name)
        //await executeNoContext(duplicateEffects, template, groupLayer)
        await executeNoContext(duplicateStyles, template, groupLayer)
      }
    }
  }
}

async function translateLayer() {
  const layerName = getElementValue('translateLayer')
  const translate_x = parseInt(getElementValue('translateX'))
  const translate_y = parseInt(getElementValue('translateY'))
  const layer = layerName.indexOf('.') != -1 ? doc.layers.getByName(layerName.split('.')[0]).layers.getByName(layerName.split('.')[1]) : doc.layers.getByName(layerName)

  await executeNoContext(select, layer)
  await executeNoContext(translate, layer, translate_x, translate_y)
}

function getElementValue(name) {
  const elem = document.getElementById(name)
  return elem.value
}

document.getElementById("btnPopulate").addEventListener("click", initCharLayers)
document.getElementById("btnDelete").addEventListener("click", deleteLayers)
document.getElementById("btnResize").addEventListener("click", forceResize)
document.getElementById("btnTranslate").addEventListener("click", translateLayer)
document.getElementById("btnEdit").addEventListener("click", editGroups)