export default (router) => {
    router.get('/ani/anime/:sn', './ani/anime');
    router.get('/ani/new_anime', './ani/new-anime');
    router.get('/gnn/:category?', './gnn-index');
    router.get('/hot/:bsn', './hot');
};
