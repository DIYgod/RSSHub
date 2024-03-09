export default (router) => {
    router.get('/book/:id/:coverOnly?/:quality?', './book');
};
