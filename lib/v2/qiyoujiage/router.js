module.exports = (router) => {
    router.get('/:path+', require('./price'));
};
