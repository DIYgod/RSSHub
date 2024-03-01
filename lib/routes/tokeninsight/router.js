export default (router) => {
    router.get('/blog/:lang?', './blog.js');
    router.get('/bulletin/:lang?', './bulletin.js');
    router.get('/report/:lang?', './report.js');
};
