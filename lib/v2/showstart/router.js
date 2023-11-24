module.exports = (router) => {
    router.get('/event/:cityCode/:showStyle?', require('./event'));
    router.get('/search/:keyword', require('./search'));
};
