module.exports = function (router) {
    router.get('/:pub/:jrn', require('./journal'));
    router.get('/:pub/:jrn/:sec', require('./section'));
};
