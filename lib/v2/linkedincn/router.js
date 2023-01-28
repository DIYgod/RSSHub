module.exports = function (router) {
    router.get('/jobs/:keywords?', require('./index.js'));
};
