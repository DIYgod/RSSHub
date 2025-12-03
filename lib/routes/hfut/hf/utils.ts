import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const typeMap = {
    tzgg: { name: 'tzgg', url: 'https://news.hfut.edu.cn/tzgg2.htm', root: 'https://news.hfut.edu.cn', title: '合肥工业大学 - 通知公告' },
    jxky: { name: 'jxky', url: 'https://news.hfut.edu.cn/tzgg2.htm', root: 'https://news.hfut.edu.cn', title: '合肥工业大学 - 通知公告 - 教学科研' },
    qttz: { name: 'qttz', url: 'https://news.hfut.edu.cn/tzgg2.htm', root: 'https://news.hfut.edu.cn', title: '合肥工业大学 - 通知公告 - 其它通知' },
};

const commLink = 'https://news.hfut.edu.cn/';

const parseList = async (ctx, type) => {
    const link = typeMap[type].url;
    const title = typeMap[type].title;

    const response = await got(link);
    const $ = load(response.data);

    const resultList = await parseArticle(typeMap[type].name, $);

    return {
        title,
        link,
        resultList,
    };
};

async function parseArticle(type, $) {
    let data = $('#tzz').find('li').toArray();

    if (type === 'jxky') {
        data = $('#c01').find('li').toArray();
    } else if (type === 'qttz') {
        data = $('#c02').find('li').toArray();
    }

    const items = data.map((item) => {
        item = $(item);
        const oriLink = item.find('a').attr('href');
        let linkRes = oriLink;
        if (!oriLink.startsWith('http')) {
            linkRes = commLink + item.find('a').attr('href');
        }
        const pubDate = parseDate(item.find('i').text(), 'YYYY-MM-DD');

        return {
            title: item.find('p').text(),
            pubDate,
            link: linkRes,
        };
    });

    const resultItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                let description;
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    description = $('.wp_articlecontent').html() ?? $('.v_news_content').html() ?? item.link;
                } catch {
                    description = item.link;
                }

                return {
                    title: item.title,
                    link: item.link,
                    description,
                    pubDate: item.pubDate,
                };
            })
        )
    );

    return resultItems;
}

export default parseList;
