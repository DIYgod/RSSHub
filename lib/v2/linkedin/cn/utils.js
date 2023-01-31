const crypto = require('crypto');
const path = require('path');
const { art } = require('@/utils/render');
const got = require('@/utils/got');
const { parseAttr } = require('./renderer');

const apiUrl = 'https://www.linkedin.cn/karpos/api/graphql';
const searchHitQueryId = 'searchSearchHitsByJob.be362cd720abd0ebf89b4bbc3253047f';
const jobPostingQueryId = 'jobsJobPostingsById.3b9573e88687a86607ddb74ff013ef50';

const makeHeader = () => {
    const sessionId = crypto.randomBytes(8).toString('hex').slice(0, 8);
    const headers = {
        Accept: '*/*',
        Cookie: `JSESSIONID="ajax:${sessionId}"`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: 'https://www.linkedin.cn/incareer/jobs/search',
        'csrf-token': `ajax:${sessionId}`,
        'x-http-method-override': 'GET',
        'x-restli-protocol-version': '2.0.0',
    };
    return headers;
};

const period = {
    1: 'r86400',
    7: 'r604800',
    30: 'r2592000',
};

const location = {
    china: '102890883',
    shanghai: '102772228',
    beijing: '103873152',
};

const makeVariables = (variables) =>
    '(' +
    Object.entries(variables)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}:${encodeURIComponent(v)}`)
        .join(',') +
    ')';

const makeBody = (body) => {
    let output = '';
    Object.entries(body).forEach(([key, value], index) => {
        output += `${key}=${value}`;
        if (index < Object.keys(body).length - 1) {
            output += '&';
        }
    });
    return output;
};

const ctxToTitle = (ctx) => {
    const { keywords } = ctx.params;
    const { geo, remote, location, period, relevant } = ctx.query;
    const g = location || geo || 'China';
    const r = remote ? '远程' : '';
    const p = period ? `近${period}天` : '';
    const o = relevant ? '相关' : '最新';
    return `${o}${p}在${g}的${keywords || ''}${r}工作机会`;
};

const parseSearchHit = async (ctx) => {
    const variables = {
        origin: 'jserp',
        isForRemoteJobsPage: !!ctx.query.remote,
        isChinaMultiNationalCorporation: false,
        count: ctx.query.limit || 20,
        start: '0',
        geoUrn: `urn:li:ks_geo:${location[ctx.query.location] || ctx.query.geo || location.china}`,
        keywords: decodeURIComponent(ctx.params.keywords || ''),
        f_TPR: period[ctx.query.period] || '',
        sortType: ctx.query.relevant ? '' : 'DATE_DESCENDING',
    };

    const resp = await got.post(apiUrl, {
        headers: makeHeader(),
        body: makeBody({
            operationName: 'searchSearchHitsByJob',
            variables: makeVariables(variables),
            queryId: searchHitQueryId,
        }),
    });

    return {
        jobs: resp.data.data.searchSearchHitsByJob.elements.map((e) => e.target.jobPosting),
        title: ctxToTitle(ctx),
    };
};

const parseJobPosting = (ctx, jobPosting) => {
    const entityUrn = jobPosting.entityUrn;
    return ctx.cache.tryGet(`linkedincn:${entityUrn}`, async () => {
        const resp = await got.post(apiUrl, {
            headers: makeHeader(),
            body: makeBody({
                operationName: 'jobViewPage',
                variables: makeVariables({
                    jobPostingUrn: entityUrn,
                }),
                queryId: jobPostingQueryId,
            }),
        });
        const job = resp.data.data.jobsJobPostingsById;
        job.desc = parseAttr(job.description);
        return {
            title: `${jobPosting.companyName} 正在找 ${jobPosting.title}`,
            link: `https://www.linkedin.cn/incareer/jobs/view/${entityUrn.split(':').pop()}`,
            guid: `linkedincn:${entityUrn}`,
            description: art(path.join(__dirname, '../templates/cn/posting.art'), job),
            pubDate: jobPosting.listedAt,
        };
    });
};

module.exports = {
    parseSearchHit,
    parseJobPosting,
};
