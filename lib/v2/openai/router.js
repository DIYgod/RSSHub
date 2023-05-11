module.exports = function (router) {
    router.get('/blog/:tag?', require('./blog'));
    router.get('/chatgpt/release-notes', require('./chatgpt'));
    router.get('/research', require('./research'));
};
