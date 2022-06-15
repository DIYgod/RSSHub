module.exports = function (router) {
    router.get('/:pub/:jrn', require('./latest'));
    router.get('/:pub/:jrn/:sec', require('./section'));
};
