module.exports = (router) => {
    router.get('/:bookName/book-series/:bookId', './book-series');
};
