module.exports = (router) => {
    router.get('/board/:board_id', require('./board'));
    router.get('/user/:user_id/notes/fulltext', require('./notes'));
    router.get('/user/:user_id/:category', require('./user'));
};
