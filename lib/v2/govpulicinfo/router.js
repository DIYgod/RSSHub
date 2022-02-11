module.exports = function (router) {
    router.get('/sichuan/deyang/:countyName/:institutionName?', require('./sichuan/deyang'));
};
