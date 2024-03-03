export default (router) => {
    router.get('/inquire/:category?/:select?/:keyword?', './inquire');
    router.get('/notice', './notice');
    router.get('/projectdynamic/:type?/:stage?/:status?', './projectdynamic');
    router.get('/rule', './rule');
};
