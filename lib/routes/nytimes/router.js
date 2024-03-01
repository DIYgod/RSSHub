export default (router) => {
    router.get('/book/:category?', './book.js');
    router.get('/daily_briefing_chinese', './daily-briefing-chinese.js');
    router.get('/:lang?', './index');
};
