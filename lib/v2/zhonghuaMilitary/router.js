module.exports = (router) => {
    router.get('/news/hot', require('./news/hotNews'));
};
