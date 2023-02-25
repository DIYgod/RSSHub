module.exports = (router) => {
    router.get('/search/:q/:order?', require('./search'));
};
