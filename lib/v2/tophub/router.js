module.exports = (router) => {
    router.get('/:id', require('./'));
    router.get('/list/:id', require('./list'));
};
