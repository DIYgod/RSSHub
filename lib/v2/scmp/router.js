module.exports = (router) => {
    router.get('/coronavirus', (c) => c.redirect('/scmp/topics/coronavirus-pandemic-all-stories'));
    router.get('/:category_id', require('./index'));
    router.get('/topics/:topic', require('./topic'));
};
