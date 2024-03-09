export default (router) => {
    router.get('/:journal/latest/vol/:sortType?', './journal'); // deprecated
    router.get('/:journal/latest/date/:sortType?', './recent'); // deprecated
    router.get('/journal/:journal/earlyaccess/:sortType?', './earlyaccess');
    router.get('/journal/:journal/recent/:sortType?', './recent');
    router.get('/journal/:journal/:sortType?', './journal');
};
