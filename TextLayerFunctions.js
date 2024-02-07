const { app, constants } = require('photoshop')
const { executeNoContext } = require('./execute')

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

async function duplicateStyles(ref, layer) {
    const refStyles = ref.textItem.characterStyle
    const refStyleProps = Object.getOwnPropertyNames(refStyles.__proto__)
    const layerStyles = layer.textItem.characterStyle
    const exclude = ['constructor', 'parent', 'middleEasternTextDirection', 'middleEasternDigitsType']
    for (let i = 0; i < refStyleProps.length; i++){
        const prop = refStyleProps[i]
        if (exclude.indexOf(prop) < 0) {
            let value
            switch (prop) {
                case 'size': continue
                case 'middleEasternTextDirection':
                    value = constants.MiddleEasternTextDirection.DEFAULT
                break
                case 'middleEasternDigitsType':
                    value = constants.MiddleEasternDigitsType.LTRARABIC
                break
                default:
                    value = refStyles[prop]
            }
            layerStyles[prop] = value
        }
    }
    layerStyles['middleEasternTextDirection'] = constants.MiddleEasternTextDirection.DEFAULT
    layerStyles['middleEasternDigitsType'] = constants.MiddleEasternDigitsType.LTRARABIC
}

module.exports = {create, changeText, duplicateStyles}