module.exports = (router) => {
    router.get('/keyword/:keyword', require('./keyword'));
};
