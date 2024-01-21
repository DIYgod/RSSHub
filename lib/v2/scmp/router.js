module.exports = (router) => {
    router.get('/:category_id', require('./index'));
    router.get('/topics/:topic', require('./topic'));
    router.get('/coronavirus', '/scmp/topics/coronavirus-pandemic-all-stories');
};
