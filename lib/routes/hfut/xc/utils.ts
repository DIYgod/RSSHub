import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const typeMap = {
    tzgg: { name: 'tzgg', url: 'https://xc.hfut.edu.cn/1955/list.htm', root: 'https://xc.hfut.edu.cn', title: '合肥工业大学宣城校区 - 通知公告' },
    gztz: { name: 'gztz', url: 'https://xc.hfut.edu.cn/gztz/list.htm', root: 'https://xc.hfut.edu.cn', title: '合肥工业大学宣城校区 - 院系动态 - 工作通知' },
};

const commLink = 'https://xc.hfut.edu.cn/';

const parseList = async (ctx, type) => {
    const link = typeMap[type].url;
    const title = typeMap[type].title;

    const response = await got(link);
    const $ = load(response.data);

    const resultList = await parseArticle($);

    return {
        title,
        link,
        resultList,
    };
};

async function parseArticle($) {
    const data = $('#wp_news_w6').find('li').toArray();

    const items = data.map((item) => {
        item = $(item);
        const oriLink = item.find('a').attr('href');
        let linkRes = oriLink;
        if (!oriLink.startsWith('http')) {
            linkRes = commLink + item.find('a').attr('href');
        }
        const pubDate = parseDate(item.find('.news_meta').text(), 'YYYY-MM-DD');

        return {
            title: item.find('a').attr('title'),
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
