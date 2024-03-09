export default (router) => {
    router.get('/3days/:location', './3days');
    router.get('/now/:location', './now');
};
