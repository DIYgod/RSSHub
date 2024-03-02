export default (router) => {
    router.get('/album/:id', './album');
    router.get('/alerts/:keyword', './alerts');
    router.get('/citations/:id', './citations');
    router.get('/doodles/:language?', './doodles');
    router.get('/fonts/:sort?', './fonts');
    router.get('/news/:category/:locale', './news');
    router.get('/scholar/:query', './scholar');
    router.get('/search/:keyword/:language?', './search');
};
