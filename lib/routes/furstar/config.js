// 文件名必须为 router.js。
// Epic Games
module.exports = {
    routes: [
        {
            path: '/furstar/characters/:lang?',
            module: './index',
        },
        {
            path: '/furstar/artists/:lang?',
            module: './artists',
        },
        {
            path: '/furstar/archive/:lang?',
            module: './archive',
        },
    ],
};
