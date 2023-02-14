module.exports = (router) => {
    router.get('/:name/:book', require('./book'));
};
