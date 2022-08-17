module.exports = (router) => {
    router.get('/military/news/hot', require('./news/hotNews'));
};
