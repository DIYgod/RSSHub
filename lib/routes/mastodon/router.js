export default (router) => {
    router.get('/account_id/:site/:account_id/statuses/:only_media?', './account-id');
    router.get('/acct/:acct/statuses/:only_media?', './acct');
    router.get('/remote/:site/:only_media?', './timeline-remote');
    router.get('/timeline/:site/:only_media?', './timeline-local');
};
