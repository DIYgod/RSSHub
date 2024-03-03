export default (router) => {
    router.get('/apod', './apod');
    router.get('/apod-ncku', './apod-ncku');
    router.get('/apod-cn', './apod-cn');
};
