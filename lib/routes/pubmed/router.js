export default (router) => {
    router.get('/trending/:filters?', './trending');
};
