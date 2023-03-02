module.exports = function (router) {
    router.get('/articles', require('./articles'));
    router.get('/dailyquestion/cn', require('./dailyquestion-cn'));
    router.get('/dailyquestion/en', require('./dailyquestion-en'));
    router.get('/dailyquestion/solution/cn', require('./dailyquestion-solution-cn'));
    router.get('/dailyquestion/solution/en', require('./dailyquestion-solution-en'));
};
