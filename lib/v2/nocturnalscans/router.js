module.exports = (router) => {
    router.get('/:name', require('./chapters'));
};
