export default (router) => {
    router.get('/imap/:email/:folder*', './imap');
};
