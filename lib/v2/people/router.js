module.exports = function (router) {
    router.get('/liuyan/:id/:state?', require('./liuyan'));
    router.get('/xjpjh/:keyword?/:year?', require('./xjpjh'));
    router.get(/([\w|\d]+)\/([\w|\d|/]+)?/, require('./index'));
    router.get('/:0?', require('./index'));
};
