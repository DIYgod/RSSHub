// @ts-nocheck
const { parseSearchHit, parseJobPosting } = require('./utils');

const siteUrl = 'https://www.linkedin.cn/incareer/jobs/search';

export default async (ctx) => {
    const { title, jobs } = await parseSearchHit(ctx);
    const items = await Promise.all(jobs.map((job) => parseJobPosting(ctx, job)));
    ctx.set('data', {
        title: `领英 - ${title}`,
        link: siteUrl,
        item: items,
    });
};
