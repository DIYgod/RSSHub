module.exports = (router) => {
    router.get('/keyword/:keyword', './keyword');
    router.get('/popular/:timeframe?', './popular');
    router.get('/user/:name', './user');
};
