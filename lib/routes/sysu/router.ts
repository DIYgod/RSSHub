export default (router) => {
    router.get('/cse', './cse');
    router.get('/ygafz/:type?', './ygafz');
};
