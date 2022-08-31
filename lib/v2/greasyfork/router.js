module.exports = (router) => {
    router.get('/:language/:domain?', require('./scripts'));
    router.get('/:language/:script/versions', require('./versions'));
};
