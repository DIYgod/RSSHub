module.exports = function (router) {
    router.get('/:keywords/:security_key?', require('./light-novel'));
};
