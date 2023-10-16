module.exports = (router) => {
    router.get('/:id?', require('./'));
    router.get('/web/:id?', require('./web/'));
};
