module.exports = (router) => {
    router.get('/news/:option?', require('./news'));
    router.get('/topics/:abbr/:category?/:option?', require('./topics'));
    router.get('/schedules/:serie?/:category?', require('./schedules'));
};
