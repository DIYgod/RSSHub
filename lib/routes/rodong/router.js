module.exports = (router) => {
    router.get('/news/:language?', './news');
};
