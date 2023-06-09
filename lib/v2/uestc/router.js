module.exports = (router) => {
    // departments
    router.get('/gr', require('./gr'));
    router.get('/cqe/:type?', require('./cqe')); // type: tzgg/hdyg
    router.get('/jwc/:type?', require('./jwc')); // type: important/student/teacher/teach/office
    router.get('/news/:type?', require('./news')); // type: announcement/academy/culture
    // schools
    router.get('/auto', require('./auto'));
    router.get('/scse', require('./scse'));
    router.get('/sice', require('./sice'));
    router.get('/sise/:type?', require('./sise')); // type: 1/2/3/4/5/6/7/8/9
};
