module.exports = (router) => {
    router.get('/jwc/:type', './jwc/jwc');
    router.get('/ceai/:type', './ceai/ceai');
};
