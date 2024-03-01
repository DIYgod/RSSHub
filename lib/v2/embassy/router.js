module.exports = (router) => {
    router.get('/:country/:city?', require('./index'));
};
