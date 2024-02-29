module.exports = function (router) {
    router.get('/:keywords/:security_key?', './light-novel');
};
