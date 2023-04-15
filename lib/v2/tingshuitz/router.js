module.exports = (router) => {
    router.get('/changsha/:channelId?', require('./changsha'));
    router.get('/dalian', require('./dalian'));
    router.get('/dongguan', require('./dongguan'));
    router.get('/guangzhou', require('./guangzhou'));
    router.get('/hangzhou', require('./hangzhou'));
    router.get('/nanjing', require('./nanjing'));
    router.get('/wuhan/:channelId?', require('./wuhan'));
    router.get('/xian', require('./xian'));
    router.get('/xiaoshan', require('./xiaoshan'));
    router.get('/yangjiang', require('./yangjiang'));
};
