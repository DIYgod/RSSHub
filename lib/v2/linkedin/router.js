module.exports = function (router) {
    router.get('/cn/jobs/:keywords?', require('./cn/index.js'));
    router.get('/jobs/:job_types/:exp_levels/:keywords?', require('./jobs.js'));
};
