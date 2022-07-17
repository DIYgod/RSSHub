module.exports = function (router) {
    router.get('/curations', require('./curations'));
    router.get('/projects', require('./projects'));
    router.get(/([\w-/]+)?/, require('./index'));
    router.get('', require('./index'));
};
