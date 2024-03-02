export default (router) => {
    router.get('/database_month', './database-month');
    router.get('/developer/group/:type', './developer/group');
    router.get('/notice/:type?', './notice');
};
