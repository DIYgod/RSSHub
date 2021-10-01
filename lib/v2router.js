import { __dirname } from '@/utils/dirname.js'
const dirname = __dirname(import.meta) + 'v2';

// 遍历整个 routes 文件夹，收集模块路由 router.js
import importAll from '@/utils/import-all.js';
const RouterPath = await importAll({
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
