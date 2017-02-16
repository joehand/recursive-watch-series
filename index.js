var watcher = require('recursive-watch')

module.exports = function (dir, onchange) {
  onchange = onchange || noop

  var changed = []
  var close = watcher(dir, function (file) {
    var index = changed.indexOf(file)
    if (index !== -1) changed.splice(index, 1) // put at pack of queue
    changed.push(file)
    onchange(file)
  })

  return {
    next: function () {
      if (!changed.length) return
      return changed.pop()
    },
    close: close
  }
}

function noop () { }
