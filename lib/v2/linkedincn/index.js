const crypto = require('crypto');
const got = require('@/utils/got');

const siteUrl = 'https://www.linkedin.cn/incareer/jobs/search';
const apiUrl = 'https://www.linkedin.cn/karpos/api/graphql';

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

const parseSearchHit = (ctx) => {
    const limit = ctx.query.limit || 20;
    const variables = {
        origin: 'jserp',
        isForRemoteJobsPage: false,
        isChinaMultiNationalCorporation: false,
        count: limit,
        start: 0,
        geoUrn: 'urn:li:ks_geo:102890883',
    };
    const resp = got.post(apiUrl, {
        headers: makeHeader(),
        form: {
            operationName: 'searchSearchHitsByJob',
            variables:
                '(' +
                Object.entries(variables)
                    .map(([k, v]) => `${k}:${encodeURIComponent(v)}`)
                    .join(',') +
                ')',
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
