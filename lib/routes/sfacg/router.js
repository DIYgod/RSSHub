export default (router) => {
    router.get('/novel/chapter/:id', require('./novel-chapter'));
};
