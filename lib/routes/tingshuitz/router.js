export default (router) => {
    router.get('/changsha/:channelId?', './changsha');
    router.get('/dalian', './dalian');
    router.get('/dongguan', './dongguan');
    router.get('/guangzhou', './guangzhou');
    router.get('/hangzhou', './hangzhou');
    router.get('/nanjing', './nanjing');
    router.get('/shenzhen', './shenzhen');
    router.get('/wuhan/:channelId?', './wuhan');
    router.get('/xian', './xian');
    router.get('/xiaoshan', './xiaoshan');
    router.get('/yangjiang', './yangjiang');
};
