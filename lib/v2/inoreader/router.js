module.exports = function (router) {
    router.get('/html_clip/:user/:tag/:num?', require('./index'));
};
