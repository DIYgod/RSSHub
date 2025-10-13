module.exports = (router) => {
    router.get('/:type?/:sort?/:filter?', require('./'));
};
