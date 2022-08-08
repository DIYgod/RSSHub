module.exports = function (router) {
    router.get('/articles', require('./articles'));
    router.get('/dailyquestion/cn', require('./dailyquestion-cn'));
    router.get('/dailyquestion/en', require('./dailyquestion-en'));
};
