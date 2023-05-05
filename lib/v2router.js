const path = require('path');
const requireAll = require('require-all');

const folders = ['private', 'v2'];
const routes = {};

folders.forEach(folder => {
    const dirname = path.join(__dirname, folder);

    // 遍历整个 routes 文件夹，收集模块路由 router.js
    const RouterPath = requireAll({
        dirname,
        filter: /router\.js$/,
    });

    // 将收集到的自定义模块路由进行合并
    for (const dir in RouterPath) {
        const project = RouterPath[dir]['router.js']; // Do not merge other file
        routes[`${dir}`] = project;
    }
});

module.exports = routes;
