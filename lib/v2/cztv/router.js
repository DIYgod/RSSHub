module.exports = (router) => {
    router.get('/zjxwlb', require('./zjxwlb'));
    router.get('/zjxwlb/daily', require('./daily'));
};
