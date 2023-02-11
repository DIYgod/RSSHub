module.exports = function (router) {
    router.get('/:country/rent/:query?', require('./list'));
};
