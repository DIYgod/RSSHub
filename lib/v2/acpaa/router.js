module.exports = (router) => {
    router.get('/:id?/:name?', require('./'));
};
