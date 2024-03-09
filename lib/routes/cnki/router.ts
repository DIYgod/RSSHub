export default (router) => {
    router.get('/journals/:name', './journals');
    router.get('/journals/debut/:name', './debut');
    router.get('/author/:code', './author');
};
