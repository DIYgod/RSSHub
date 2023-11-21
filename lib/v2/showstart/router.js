module.exports = (router) => {
    router.get('/event/:cityCode/:showStyle?/:keyword?', require('./event'));
};
