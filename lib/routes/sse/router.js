export default (router) => {
    router.get('/convert/:query?', './convert');
    router.get('/disclosure/:query?', './disclosure');
    router.get('/inquire', './inquire');
    router.get('/lawandrules/:slug?', './lawandrules');
    router.get('/renewal', './renewal');
};
