const { core } = require('photoshop')

const execute = async (fn) => {
    return await core.executeAsModal(fn)
  }
  
const executeNoContext = async(fn, ...args) => {
    return await execute(() => fn.apply(null, args))
}

const executeActions = async (fn) => {
  return await core.executeAsModal(fn, {"commandName": "Action Commands"});
}

module.exports = {execute, executeNoContext, executeActions}