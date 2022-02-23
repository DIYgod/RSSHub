module.exports = function (router) {
    router.get('/release/:user/:app/:distribution_group', require('./release'));
};
