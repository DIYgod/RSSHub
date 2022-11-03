module.exports = (router) => {
    router.get('/search', require('./search'));
    router.get('/top30event', require('./top30event'));
};
