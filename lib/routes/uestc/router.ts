export default (router) => {
    // departments
    router.get('/gr', './gr');
    router.get('/cqe/:type?', './cqe'); // type: tzgg/hdyg
    router.get('/jwc/:type?', './jwc'); // type: important/student/teacher/teach/office
    router.get('/news/:type?', './news'); // type: announcement/academy/culture
    // schools
    router.get('/auto', './auto');
    router.get('/scse', './scse');
    router.get('/sice', './sice');
    router.get('/sise/:type?', './sise'); // type: 1/2/3/4/5/6/7/8/9
};
