module.exports = (router) => {
    router.get('/podcast/:id', './podcast');
    router.get('/', './pickup');
};
