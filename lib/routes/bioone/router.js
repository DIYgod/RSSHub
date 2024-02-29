module.exports = function (router) {
    router.get('/featured', './featured');
    router.get('/journals/:journal?', './journal');
};
