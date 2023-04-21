module.exports = (router) => {
    router.get('/board/:board_id', require('./board'));
    router.get('/user/:user_id/collect', require('./user'));
    router.get('/user/:user_id/notes', require('./notes'));
};
