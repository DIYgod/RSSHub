module.exports = (router) => {
    router.get('/keyword/:keyword', require('./keyword'));
    router.get('/popular/:timeframe?', require('./popular'));
    router.get('/user/:name', require('./user'));
};
