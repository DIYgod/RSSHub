export default (router) => {
    router.get('/', './daily-wallpaper');
    router.get('/search/:keyword', './search');
};
