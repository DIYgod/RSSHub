// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const getAritlces = async (category, url, cache) => {
    const { data } = await got(url);
    const $ = load(data);
    const spiderResult = $('ul.article-list')
        .children()
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            const link = a.attr('href');

            return {
                title: a.text(),
                link,
                pubDate: timezone(parseDate(item.find('span.time').text()), +8),
                category,
            };
        })
        .map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);
                const aritcleContent = $(data).find('div.detail').html();
                item.description = aritcleContent;
                return item;
            })
        );
    if (spiderResult.length === 0) {
        return [];
    }
    return Promise.all(spiderResult);
};

const getItemsFromURLs = async (URLs, cache) => {
    let items = Object.keys(URLs).map((key) => getAritlces(key, URLs[key], cache));
    items = await Promise.all(items);
    items = items.flat();
    return items;
};

module.exports.announcementsRouter = async (ctx) => {
    const URLs = {
        党政: 'https://physics.scnu.edu.cn/NEWS/Notices/PartyAndGovernment/',
        教务: 'https://physics.scnu.edu.cn/NEWS/Notices/Education/',
        科研: 'https://physics.scnu.edu.cn/NEWS/Notices/Research/',
        人事: 'https://physics.scnu.edu.cn/NEWS/Notices/People/',
        综合: 'https://physics.scnu.edu.cn/NEWS/Notices/General/',
        学工: 'https://physics.scnu.edu.cn/NEWS/Notices/Students/',
    };
    const items = await getItemsFromURLs(URLs, cache);
    ctx.set('data', {
        title: '华南师范大学物理与电信工程学院通知',
        link: 'https://physics.scnu.edu.cn/NEWS/Notices/',
        item: items,
    });
};

module.exports.newsRouter = async (ctx) => {
    const URLs = {
        学院新闻: 'https://physics.scnu.edu.cn/NEWS/News/College/',
        教务新闻: 'https://physics.scnu.edu.cn/NEWS/News/Education/',
        学工新闻: 'https://physics.scnu.edu.cn/NEWS/News/Education/',
        科研新闻: 'https://physics.scnu.edu.cn/NEWS/News/Research/',
        院友新闻: 'https://physics.scnu.edu.cn/NEWS/News/People/',
    };
    const items = await getItemsFromURLs(URLs, cache);
    ctx.set('data', {
        title: '华南师范大学物理与电信工程学院新闻动态',
        link: 'https://physics.scnu.edu.cn/NEWS/News/',
        item: items,
    });
};

module.exports.researchNewsRouter = async (ctx) => {
    const URLs = {
        学术报告: 'https://physics.scnu.edu.cn/RESEARCH/EVENTS/Seminars/',
        学术会议: 'https://physics.scnu.edu.cn/RESEARCH/EVENTS/Conferences/',
        科研平台: 'https://physics.scnu.edu.cn/RESEARCH/Institutes/',
        研究方向: 'https://physics.scnu.edu.cn/RESEARCH/ResearchAreas/',
        重大项目: 'https://physics.scnu.edu.cn/RESEARCH/Projects/',
        科研成果: 'https://physics.scnu.edu.cn/RESEARCH/Achievements/',
    };
    const items = await getItemsFromURLs(URLs, cache);
    ctx.set('data', {
        title: '华南师范大学物理与电信工程学院科学研究动态',
        link: 'https://physics.scnu.edu.cn/RESEARCH/',
        item: items,
    });
};
