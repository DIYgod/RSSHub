module.exports = (router) => {
    router.get('/podcast/:id', require('./podcast'));
    router.get('/', require('./pickup'));
};
