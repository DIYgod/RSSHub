module.exports = function (router) {
    router.get('/:experts_id', require('./experts'));
    router.get('/portal/hot', require('./hot'));
    router.get('/', require('./index'));
};
