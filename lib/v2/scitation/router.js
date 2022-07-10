module.exports = function (router) {
    router.get('/:pub/:jrn', require('./journal'));
};
