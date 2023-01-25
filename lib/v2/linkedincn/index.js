const crypto = require('crypto');
const path = require('path');
const { art } = require('@/utils/render');
const got = require('@/utils/got');

const siteUrl = 'https://www.linkedin.cn/incareer/jobs/search';
const apiUrl = 'https://www.linkedin.cn/karpos/api/graphql';

const searchHitQueryId = 'searchSearchHitsByJob.be362cd720abd0ebf89b4bbc3253047f';
const jobPostingQueryId = 'jobsJobPostingsById.3b9573e88687a86607ddb74ff013ef50';

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

const makeVariables = (variables) =>
    '(' +
    Object.entries(variables)
        .map(([k, v]) => `${k}:${encodeURIComponent(v)}`)
        .join(',') +
    ')';

const parseSearchHit = (ctx) => {
    const limit = ctx.query.limit || 20;
    const variables = {
        origin: 'jserp',
        isForRemoteJobsPage: false,
        isChinaMultiNationalCorporation: false,
        count: limit,
        start: 0,
        geoUrn: ctx.query.location || 'urn:li:ks_geo:102890883',
    };
    const resp = got.post(apiUrl, {
        headers: makeHeader(),
        form: {
            operationName: 'searchSearchHitsByJob',
            variables: makeVariables(variables),
            queryId: searchHitQueryId,
        },
    });
    return resp.data.data.searchSearchHitsByJob.elements.map((e) => e.target.jobPosting);
};

const parseJobPosting = (jobPosting) => {
    const variables = {
        jobPostingUrn: jobPosting.entityUrn,
    };
    const resp = got.post(apiUrl, {
        headers: makeHeader(),
        form: {
            operationName: 'jobViewPage',
            variables: makeVariables(variables),
            queryId: jobPostingQueryId,
        },
    });
    const job = resp.data.jobsJobPostingsById;
    return art(path.join(__dirname, 'templates/image_figure.art'), job);
};

module.exports = {
    siteUrl,
    parseSearchHit,
    parseJobPosting,
};
