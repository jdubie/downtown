var path    = require('path'),
    async   = require('async'),
    express = require('express'),
    fs      = require('fs'),
    marked  = require('marked'),
    watch   = require('node-watch'),
    events  = require('events');

var app = express();

app.use(express.static(__dirname + '/public'));

emitter = new events.EventEmitter();

/*
 * Watch for current working directory for updates
 */
watch(process.cwd(), function(filename) {
  console.log(filename, ' changed.');
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

app.use(function(req, res, next) {
  if (req.path === '/updates' || req.path === '/refresh.js') {
    return next();
  }

  var relPath = req.path;

  fs.exists(absPath(relPath), function(exists) {
    if (exists) {
      fs.stat(absPath(relPath), function(err, stat) {
        if (stat.isFile()) {
          renderPath(relPath, res);
        } else if (stat.isDirectory()) {
          renderDirectory(relPath, res);
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });
});

var renderDirectory = function(dir, res) {
  console.log('renderDirectory', dir);
  fs.readdir(absPath(dir), function(err, entries) {
    console.log(err, entries);
    entries = entries.map(function(entry) { return path.join(dir, entry); });
    async.parallel({
      mds: filterMarkdown(entries),
      dirs: filterDirs(entries)
    }, function(err, links) {
      console.log(links);
      res.write("<html>");
      if (links.length === 0) {
        res.write("<p>Sorry no *.md files in here...</p>");
      } else {
        res.write("<ul>");
        for (link in links.mds) {
          link = links.mds[link];
          res.write("<li><strong><a href=\"" + link + "\">" + link + "</a></strong></li>");
        }
        for (link in links.dirs) {
          link = links.dirs[link];
          res.write("<li><a href=\"" + link + "\">" + link + "</a></li>");
        }
        res.write("</ul>");
      }
      res.write("</html>");
      res.end();
    });

  });
}

var renderPath = function(path, res) {
  path = absPath(path);
  fs.readFile(path, 'utf8', function(err, file) {
    res.write("<html>");
    res.write("<head>");
    res.write("<script src=\"//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js\"></script>");
    res.write("<script src=\"refresh.js\"></script>");
    res.write('<link href="https://gist.github.com/andyferra/2554919/raw/2e66cabdafe1c9a7f354aa2ebf5bc38265e638e5/github.css" rel="stylesheet">');
    res.write("</head>");
    res.write("<body>");
    res.write(marked(file));
    res.write("</body>");
    res.write("</html>");
    res.end();
  });
};

var filterDirs = function(entries) {
  return function (callback) {
    async.filter(entries, function(entry, callback) {
      fs.stat(absPath(entry), function(err, stat) {
        if (err) return callback(false);
        callback(stat.isDirectory())
      });
    }, function(results) { callback(null, results); });
  }
};

var filterMarkdown = function(entries) {
  return function (callback) {
    async.filter(entries, function(entry, callback) {
      fs.stat(absPath(entry), function(err, stat) {
        if (err) return callback(false);
        callback(stat.isFile() && entry.match(/.*md/));
      });
    }, function(results) { callback(null, results); });
  }
};

var absPath = function(relPath) { return path.join(process.cwd(), relPath); };

app.listen(8383);
