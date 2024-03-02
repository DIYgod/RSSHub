export default (router) => {
    router.get('/', './index');
    router.get('/review/:keyword?', './review');
};
