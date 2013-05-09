var path = require('path');

/**
 * Returns path relative to process's current working directory
 * @param {String} relPath
 * @return {String}
 */

exports.absPath = function(relPath) {
  return path.join(process.cwd(), relPath);
};
