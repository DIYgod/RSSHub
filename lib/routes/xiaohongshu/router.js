export default (router) => {
    router.get('/board/:board_id', './board');
    router.get('/user/:user_id/notes/fulltext', './notes');
    router.get('/user/:user_id/:category', './user');
};
