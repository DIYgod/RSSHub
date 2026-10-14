import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

import { sdrj } from './sdrj';
import { view } from './view';
import { jwc } from './wh/jwc';
import { news } from './wh/news';

async function getExamArticle(link: string) {
    let response;
    try {
        response = await got(link);
    } catch (error) {
        if (error instanceof FetchError) {
            return {};
        }
        throw error;
    }
    const $ = load(response.data);
    const date = /发布(?:时间|日期)：\s*(\d{4}-\d{2}-\d{2})/.exec($('.MLspan').text())?.[1];
    return { description: $('#UCAP-CONTENT, .txt').first().html() ?? undefined, exactDate: date ? parseDateInTimezone(date, 8) : undefined };
}

const index = (link) => {
    if (link.startsWith('https://xinwen.wh.sdu.edu.cn/')) {
        return news(link);
    }
    if (link.startsWith('https://www.view.sdu.edu.cn/')) {
        return view(link);
    }
    if (link.startsWith('https://www.sdrj.sdu.edu.cn/')) {
        return sdrj(link);
    }
    if (link.startsWith('https://jwc.wh.sdu.edu.cn/')) {
        return jwc(link);
    }
    if (link.startsWith('https://www.sdzk.cn/NewsInfo.aspx?')) {
        return getExamArticle(link);
    }
    return Promise.resolve({});
};
// TODO: missing route export
export default index;
