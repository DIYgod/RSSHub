module.exports = (router) => {
    router.redirect('/daily', '/nbd/332');
    router.get('/:id?', require('./index'));
};
