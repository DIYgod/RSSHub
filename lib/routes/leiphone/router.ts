export default (router) => {
    router.get('/newsflash', './newsflash');
    router.get('/:do?/:keyword?', './index');
};
