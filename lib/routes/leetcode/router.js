export default (router) => {
    router.get('/articles', './articles');
    router.get('/dailyquestion/cn', './dailyquestion-cn');
    router.get('/dailyquestion/en', './dailyquestion-en');
    router.get('/dailyquestion/solution/cn', './dailyquestion-solution-cn');
    router.get('/dailyquestion/solution/en', './dailyquestion-solution-en');
};
