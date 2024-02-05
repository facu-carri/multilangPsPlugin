const { app } = require('photoshop')

async function create(char, font, fontSize = 24, pos = { x: 0, y: 0 }) {
    await app.activeDocument.createTextLayer({
        name: char, 
        contents: char, 
        fontName:font, 
        fontSize: getFontSize(fontSize),
        position: pos
    })
}
  
function getFontSize(size){
    return (doc.resolution / 72) * size
}

function changeFont(layer, font, size = null) {
    const textItem = layer.textItem
    const style = textItem.characterStyle
    style.font = font
    if (size) style.size = size
}

function changeText(layer, text){
    const textItem = layer.textItem
    textItem.contents = text
}

module.exports = {create, changeText}