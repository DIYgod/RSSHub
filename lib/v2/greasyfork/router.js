module.exports = (router) => {
    router.get('/:language/:domain?', require('./scripts'));
};
