module.exports = function (router) {
    router.get('/discount/:platform/:filter?/:countries?', './discount.js');
};
