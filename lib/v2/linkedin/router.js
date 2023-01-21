module.exports = function (router) {
    router.get('/jobs/:job_types/:exp_levels/:keywords?', require('./jobs.js'));
};
