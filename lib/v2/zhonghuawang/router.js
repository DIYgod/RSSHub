module.exports = (router) => {
    router.get('/military/news/hot', require('./military/news/hotNews'));
};
