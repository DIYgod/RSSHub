export default (router) => {
    router.get('/programme/:id?/:limit?/:isFull?', './programme');
};
