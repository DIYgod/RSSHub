module.exports = (router) => {
    router.get('/activity/:city/:category/:subcategory/:keyword?', require('./activity'));
};
