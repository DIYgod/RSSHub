module.exports = (router) => {
    router.get('/:params*', require('./'));
};
