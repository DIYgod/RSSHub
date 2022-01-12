module.exports = function (router) {
    router.get('/learnku/:community/:category?', require('./topic.js'));
};
