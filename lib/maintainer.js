import { __dirname } from './utils/dirname.js';
import importAll from './utils/import-all.js';
import v1Router from './router.js';

const dirname = __dirname(import.meta.url) + '/v2';

// 遍历整个 routes 文件夹，收集模块 maintainer.js
const maintainerPath = importAll({
    dirname,
    filter: /maintainer\.js$/,
});

const maintainers = {};

// 将收集到的自定义模块进行合并
for (const dir in maintainerPath) {
    const routes = maintainerPath[dir]['maintainer.js']; // Do not merge other file
    for (const key in routes) {
        maintainers['/' + dir + key] = routes[key];
    }
}

// 兼容旧版路由
v1Router.stack.forEach((e) => {
    if (!maintainers[e.path]) {
        maintainers[e.path] = [];
    }
});

export default maintainers;
