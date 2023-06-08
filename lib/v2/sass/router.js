module.exports = (router) => {
    router.get('/gs/:type', require('./gs/index'));
};
