module.exports = (router) => {
    router.get('/news/:category?/:language?', './news');
    router.get('/today/:language?', './today');
};
