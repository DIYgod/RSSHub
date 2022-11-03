module.exports = (router) => {
    router.get('/files/:share_id/:parent_file_id?', require('./files'));
};
