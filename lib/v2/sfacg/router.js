module.exports = (router) => {
    router.get('/novel/chapter/:id', require('./novel-chapter'));
};
