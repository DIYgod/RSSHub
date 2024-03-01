module.exports = (router) => {
    router.get('/book/:category?', require('./book.js'));
    router.get('/daily_briefing_chinese', require('./daily-briefing-chinese.js'));
    router.get('/:lang?', require('./index'));
};
