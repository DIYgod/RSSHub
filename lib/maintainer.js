import { __dirname } from '@/utils/dirname.js'
const dirname = __dirname(import.meta) + '/v2';

// 遍历整个 routes 文件夹，收集模块 maintainer.js
import importAll from '@/utils/import-all.js';
const maintainerPath = await importAll({
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
import router from './router.js';
router.stack.forEach((e) => {
    if (!maintainers[e.path]) {
        maintainers[e.path] = [];
    }
});

export default maintainers;
