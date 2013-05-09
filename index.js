/**
 * Module dependencies.
 */

var express = require('express'),
    fs      = require('fs'),
    watch   = require('node-watch'),
    events  = require('events'),
    render  = require('./render');
    helper  = require('./helper');

var app = express();
app.use(express.static(__dirname + '/public'));

/*
 * Watch for current working directory for updates
 */
emitter = new events.EventEmitter();

watch(process.cwd(), function(filename) {
  file = fs.readFile(filename, 'utf8', function() {
    emitter.emit('change', filename);
  });
});

app.get('/updates', function(req, res) {

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Transfer-Encoding', 'chunked');

  emitter.on('change', function() {
    res.write("event: refresh\r\n");
    res.write("data: \r\n\r\n");
  });

});


/**
 * Looks for markdown or directories to render
 */

app.use(function(req, res, next) {

  /*
   * Server up /updates and /refresh.js normally
   */
  if (req.path === '/updates' || req.path === '/refresh.js') {
    return next();
  }

  var relPath = req.path;

  fs.exists(helper.absPath(relPath), function(exists) {
    if (exists) {
      fs.stat(helper.absPath(relPath), function(err, stat) {
        if (stat.isFile()) {
          render.path(relPath, res);
        } else if (stat.isDirectory()) {
          render.directory(relPath, res);
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });
});

app.listen(6969);
