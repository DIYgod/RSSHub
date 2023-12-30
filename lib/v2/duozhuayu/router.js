module.exports = (router) => {
    router.get('/search/:wd', require('./search'));
};
