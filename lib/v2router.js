const dirname = __dirname + '/v2';

// 遍历整个 routes 文件夹，收集模块路由 router.js
import requireAll from 'require-all';
const RouterPath = requireAll({
    dirname,
    filter: /router\.js$/,
});

const routes = {};

// 将收集到的自定义模块路由进行合并
for (const dir in RouterPath) {
    const project = RouterPath[dir]['router.js']; // Do not merge other file
    routes[dir] = project;
}

export default routes;
