const crypto = require('crypto');
const siteUrl = 'https://www.linkedin.cn/incareer/jobs/search';
const apiUrl = 'https://www.linkedin.cn/karpos/api/graphql';
const got = require('@/utils/got');

const makeHeader = () => {
    const sessionId = crypto.randomBytes(8).toString('hex').slice(0, 8);
    const headers = {
        Cookie: `JSESSIONID="ajax:${sessionId}";`,
        Origin: 'https://www.linkedin.cn',
        Referer: 'https://www.linkedin.cn/incareer/jobs/search',
        'csrf-token': `ajax:${sessionId}`,
        'x-http-method-override': 'GET',
        'x-restli-protocol-version': '2.0.0',
    };
    return headers;
};
const parseSearchHit = () => {
    const resp = got.post(apiUrl, {
        headers: makeHeader(),
        form: {
            operationName: 'searchSearchHitsByJob',
            variables: '',
            queryId: 'searchSearchHitsByJob.be362cd720abd0ebf89b4bbc3253047f',
        },
    });
    return resp.data.searchSearchHitsByJob.elements.map((e) => e.target.jobPosting);
};

const parseJobPosting = () => {};
module.exports = {
    siteUrl,
    parseSearchHit,
    parseJobPosting,
};
