module.exports = (router) => {
    router.get('/coronavirus', '/scmp/topics/coronavirus-pandemic-all-stories');
    router.get('/:category_id', require('./index'));
    router.get('/topics/:topic', require('./topic'));
};
