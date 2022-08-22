module.exports = (router) => {
    router.get('/boards', require('./boards'));
    router.get('/:board?', require('./index'));
};
