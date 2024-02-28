module.exports = (router) => {
    router.get('/daily', (c) => c.redirect('/nbd/332'));
    router.get('/:id?', require('./index'));
};
