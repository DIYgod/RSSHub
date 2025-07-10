import got from '@/utils/got';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';

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

export default { descpPage, renderDetail, renderDesc };
