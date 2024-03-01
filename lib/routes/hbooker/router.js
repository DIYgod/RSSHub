export default (router) => {
    router.get('/chapter/:id', require('./chapter'));
};
