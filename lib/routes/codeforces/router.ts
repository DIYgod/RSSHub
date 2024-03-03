export default (router) => {
    router.get('/contests', './contests');
    router.get('/recent-actions/:minrating?', './recent-actions');
};
