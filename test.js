
var fs = require('fs')
var path = require('path')
var test = require('tape')
var watcher = require('.')

test('change one file', function (t) {
  var watch = watcher(path.join(__dirname, '..'))
  var tmp = path.join(__dirname, Math.random().toString(16).slice(2))
  fs.writeFile(tmp, 'hello there', function (err) {
    t.ifError(err)
    var next = watch.next()
    if (!next) return setTimeout(done, 100)
    done()

    function done () {
      next = next || watch.next()
      t.same(next, tmp, 'next is tmp')

      fs.unlink(tmp, function () {
        watch.close()
        // watcher not closing sync
        setTimeout(function () {
          t.end()
        }, 200)
      })
    }
  })
})

test('change same file twice', function (t) {
  var watch = watcher(path.join(__dirname, '..'))
  var tmp = path.join(__dirname, Math.random().toString(16).slice(2))
  fs.writeFile(tmp, 'hello there', function (err) {
    t.ifError(err)
    fs.writeFile(tmp, 'hello again', function (err) {
      t.ifError(err)

      var next = watch.next()
      if (!next) return setTimeout(done, 100)
      done()

      function done () {
        next = next || watch.next()
        t.same(next, tmp, 'next is tmp')
        t.notOk(watch.next(), 'no next item')
        fs.unlink(tmp, function () {
          watch.close()
          // watcher not closing sync
          setTimeout(function () {
            t.end()
          }, 200)
        })
      }
    })
  })
})

test('change multiple files', function (t) {
  var changedFiles = 0
  var watch = watcher(path.join(__dirname, '..'))

  var tmp = path.join(__dirname, Math.random().toString(16).slice(2))
  var tmp2 = path.join(__dirname, Math.random().toString(16).slice(2))
  var tmp3 = path.join(__dirname, Math.random().toString(16).slice(2))
  var files = [tmp, tmp2, tmp3]

  fs.writeFile(tmp, 'hello')
  fs.writeFile(tmp2, 'person')
  fs.writeFile(tmp3, 'reading this')

  next()

  function next () {
    var changed = watch.next()
    if (changedFiles === 3) {
      if (changed) t.fail('too many files changed')
      return done()
    }
    if (!changed) return setTimeout(next, 100)

    changedFiles++
    t.ok(files.indexOf(changed) > -1, 'file is changed')
    next()
  }

  function done () {
    fs.unlinkSync(tmp)
    fs.unlinkSync(tmp2)
    fs.unlinkSync(tmp3)
    watch.close()
    t.end()
  }
})
