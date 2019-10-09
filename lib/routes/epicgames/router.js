// 文件名必须为 router.js ，${workdir}/lib/router.js 文件调用、识别所需。
// Epic Games
module.exports = {
    // 第一级的方法名随便定义，并不会实际使用。只要不重复即可。
    // 第二级的 "routerPath"、"indexFile" 方法名要求固定，不能写错，router.js 文件会进行调用。
    // 0: {
    //     routerPath: '/epicgames/:collection',
    //     indexFile: './index',
    // },
    1: {
        routerPath: '/epicgames/:collection',
        indexFile: './index',
    },
};
