module.exports = (router) => {
    router.get('/author/:byline', require('./author.js'));
    router.get('/book/:category?', require('./book.js'));
    router.get('/daily_briefing_chinese', require('./daily_briefing_chinese'));
    router.get('/:lang?', require('./index'));
};
