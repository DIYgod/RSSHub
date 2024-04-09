module.exports = function (router) {
    router.get('/:pub/:jrn', require('./journal'));
    // router.get('/:pub/:jrn', require('./journal-pupp')); // Switch to this route if the official website blocks the "got" method.
};
