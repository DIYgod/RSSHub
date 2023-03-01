module.exports = (router) => {
    router.get('/:node/:page?', require('./index'));
};
