module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/tag/:tag', require('./tag'));
};
