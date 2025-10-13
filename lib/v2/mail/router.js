module.exports = (router) => {
    router.get('/imap/:email/:folder*', require('./imap'));
};
