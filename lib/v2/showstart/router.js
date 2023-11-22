module.exports = (router) => {
    router.get('/event/:cityCode/:showStyle?', require('./event'));
};
