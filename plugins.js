const Router = require('koa-router');
const router = new Router();

const fs = require('fs');
const path = require('path');
const pluginsPath = path.join(__dirname, 'plugins');

fs.readdirSync(pluginsPath).forEach((item) => {
    item = path.join(pluginsPath, item);
    if (!fs.lstatSync(item).isDirectory()) {
        return;
    }
    use(item);
});

function use(directory) {
    fs.readdirSync(directory).forEach((item) => {
        item = path.join(directory, item);
        if (!fs.lstatSync(item).isFile() || path.extname(item).toLowerCase() !== '.js') {
            return;
        }
        const plugin = require('./' + path.join(path.relative(__dirname, path.dirname(item)), path.basename(item, '.js')));
        if (!plugin.paths || !(plugin.paths instanceof Array) || !plugin.paths.length || !plugin.middleware) {
            return;
        }
        plugin.paths.forEach((p) => {
            router.get(p, plugin.middleware);
        });
    });
}

module.exports = router;
