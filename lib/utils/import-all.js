// https://github.com/felixge/node-require-all/blob/master/index.js
import fs from 'node:fs';

const DEFAULT_EXCLUDE_DIR = /^\./;
const DEFAULT_FILTER = /^([^\.].*)\.js(on)?$/;
const DEFAULT_RECURSIVE = true;

async function importAll(options) {
  const dirname = typeof options === 'string' ? options : options.dirname;
  const excludeDirs = options.excludeDirs === undefined ? DEFAULT_EXCLUDE_DIR : options.excludeDirs;
  const filter = options.filter === undefined ? DEFAULT_FILTER : options.filter;
  const modules = {};
  const recursive = options.recursive === undefined ? DEFAULT_RECURSIVE : options.recursive;
  const resolve = options.resolve || identity;
  const map = options.map || identity;

  function excludeDirectory(dirname) {
    return !recursive ||
      (excludeDirs && dirname.match(excludeDirs));
  }

  function filterFile(filename) {
    if (typeof filter === 'function') {
      return filter(filename);
    }

    const match = filename.match(filter);
    if (!match) {return;}

    return match[1] || match[0];
  }

  const files = fs.readdirSync(dirname);

  for (const file of files) {
    const filepath = dirname + '/' + file;
    if (fs.statSync(filepath).isDirectory()) {

      if (excludeDirectory(file)) {continue;}

      const subModules = await importAll({
        dirname: filepath,
        filter,
        excludeDirs,
        map,
        resolve
      });

      if (Object.keys(subModules).length === 0) {continue;}

      modules[map(file, filepath)] = subModules;

    } else {
      const name = filterFile(file);
      if (!name) {continue;}

      modules[map(name, filepath)] = resolve((await import(filepath)).default);
    }
  }

  return modules;
};

function identity(val) {
  return val;
}

export default importAll;