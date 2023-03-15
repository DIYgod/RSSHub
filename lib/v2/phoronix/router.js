module.exports = (router) => {
    router.get('/:page/:queryOrItem?', require('./index'));
};
