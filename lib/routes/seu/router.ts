export default (router) => {
    router.get('/cse/:type?', './cse');
    router.get('/radio/academic', './radio/academic');
    router.get('/yjs', './yjs');
    router.get('/yzb/:type', './yzb');
};
