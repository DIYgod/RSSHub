module.exports = (router) => {
    router.get('/news/breakingnews/:id', require('./breaking-news'));
};
