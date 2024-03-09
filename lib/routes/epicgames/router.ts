export default (router) => {
    router.get('/freegames/:locale?/:country?', './index');
};
