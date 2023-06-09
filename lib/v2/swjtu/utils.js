const got = require('@/utils/got');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');

const renderDetail = (jobs) => art(path.join(__dirname, 'templates/job_detail.art'), { jobs });
const renderDesc = (intro) =>
    art(path.join(__dirname, 'templates/job_desc.art'), {
        intro,
        job_list: renderDetail(intro.zwxxList),
    });

const descpPage = (link, cache) =>
    cache.tryGet(link, async () => {
        const data = await got({
            method: 'post',
            url: link,
        });
        const intro = data.data.data;

        return {
            title: `${intro.dwmc}（${intro.xzyjmc}）`,
            pubDate: parseDate(String(intro.fbrq)),
            description: renderDesc(intro),
            link: String(link.replace('data', 'view')),
        };
    });

module.exports = {
    descpPage,
    renderDetail,
    renderDesc,
};
