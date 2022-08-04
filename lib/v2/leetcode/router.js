module.exports = function (router) {
    router.get('/dailyquestion/en', require('./dailyquestion-en'));
    router.get('/dailyquestion/cn', require('./dailyquestion-cn'));
};
