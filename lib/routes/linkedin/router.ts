export default (router) => {
    router.get('/cn/jobs/:keywords?', './cn/index.js');
    router.get('/jobs/:job_types/:exp_levels/:keywords?', './jobs.js');
};
