export default (router) => {
    router.get('/journal/:id/:category?', './journal');
};
