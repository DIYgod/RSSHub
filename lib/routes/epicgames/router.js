// 文件名必须为 router.js。
// Epic Games

module.exports = () => {
    const Router = require('@koa/router');
    const router = new Router();
    router.get('/epicgames/:collection', require('./index'));
    return router;
};
