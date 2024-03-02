export default (router) => {
    router.get('/keyword/:keyword', './keyword');
    router.get('/popular/:timeframe?', './popular');
    router.get('/user/:name', './user');
};
