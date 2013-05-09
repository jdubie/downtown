/**
 * Module depencies.
 */

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    marked  = require('marked'),
    helper = require('./helper');


/**
 * Constants
 */

var MD_EXT = /.*\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)/;


/**
 * Renders file at `path` back to client
 * @param {String} path
 * @param {express.HTTPResposne} res
 *
 * @todo use (mustache) templating instead of writing HTML directly
 */

exports.path = function(path, res) {
  path = helper.absPath(path);
  fs.readFile(path, 'utf8', function(err, file) {
    res.write("<html>");
    res.write("<head>");
    res.write("<script src=\"/jquery.min.js\"></script>");
    res.write("<script src=\"/refresh.js\"></script>");
    res.write('<link href="/github.css" rel="stylesheet">');
    res.write("</head>");
    res.write("<body>");
    res.write(marked(file));
    res.write("</body>");
    res.write("</html>");
    res.end();
  });
};


/**
 * Renders directory `dir` back to client
 * @param {String} dir
 * @param {express.HTTPResposne} res
 *
 * @todo use (mustache) templating instead of writing HTML directly
 */

exports.directory = function(dir, res) {

  fs.readdir(helper.absPath(dir), function(err, entries) {
    entries = entries.map(function(entry) { return path.join(dir, entry); });
    async.parallel({
      mds: filterMarkdown(entries),
      dirs: filterDirs(entries)
    }, function(err, links) {
      res.write("<html>");
      allLinks = [].concat(links.mds, links.dirs);
      if (allLinks.length === 0) {
        res.write("<p>Sorry no *.md files in here...</p>");
      } else {
        res.write("<h3>Markdown files:</h3>");
        res.write("<ul>");
        for (link in links.mds) {
          link = links.mds[link];
          res.write("<li><strong><a href=\"" + link + "\">" + link + "</a></strong></li>");
        }
        res.write("</ul>");

        res.write("<h3>Directories:</h3>");
        res.write("<ul>");
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


/*
 * Filters out non-directories
 * @param Array.<String> entries
 * @return {function}
 */

var filterDirs = function(entries) {
  return function (callback) {
    async.filter(entries, function(entry, callback) {
      fs.stat(helper.absPath(entry), function(err, stat) {
        if (err) return callback(false);
        callback(stat.isDirectory())
      });
    }, function(results) { callback(null, results); });
  }
};


/*
 * Filters out files without markdown extensions
 * @param Array.<String> entries
 * @return {function}
 */

var filterMarkdown = function(entries) {
  return function (callback) {
    async.filter(entries, function(entry, callback) {
      fs.stat(helper.absPath(entry), function(err, stat) {
        if (err) return callback(false);
        callback(stat.isFile() && entry.match(MD_EXT));
      });
    }, function(results) { callback(null, results); });
  }
};
