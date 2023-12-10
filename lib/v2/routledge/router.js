module.exports = (router) => {
    router.get('/:bookName/book-series/:bookId', require('./book-series'));
};
