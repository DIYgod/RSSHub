module.exports = (router) => {
    router.get('/popular/:range?', require('./popular'));
    router.get('/user_article/:id', require('./user_article'));
    router.get('/wen', require('./wen'));
};
