export default (router) => {
    router.get('/admission', './admission');
    router.get('/dafls', './dafls');
    router.get('/exchangesys/:type', './exchangesys');
    router.get('/gra', './gra');
    router.get('/hospital', './hosptial');
    router.get('/hqjt', './hqjt');
    router.get('/itsc', './itsc');
    router.get('/jjc', './jjc');
    router.get('/jw/:type', './jw');
    router.get('/rczp/:type', './rczp');
    router.get('/scit/:type', './scit');
    router.get('/zbb/:type', './zbb');
    router.get('/zcc', './zcc');
};
