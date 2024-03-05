// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const categoryMap = {
        studyinusa: {
            title: '留学申请',
            id: 18,
        },
        career: {
            title: '找工求职',
            id: 200,
        },
        lifestyle: {
            title: '生活攻略',
            id: 370,
        },
        invest: {
            title: '投资理财',
            id: 371,
        },
        visa: {
            title: '签证移民',
            id: 194,
        },
        news: {
            title: '时政要闻',
            id: 366,
        },
    };

    const category = ctx.req.param('category');

    const rootUrl = 'https://blog.1point3acres.com';
    const currentUrl = `${rootUrl}/${category}/`;
    const { data } = await got(`${rootUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            categories: category ? categoryMap[category].id : undefined,
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100,
        },
    });

    const items = data.map((item) => {
        const $ = load(item.content.rendered, null, false);
        $('h2').nextAll().remove();
        $('[powered-by="1p3a"], h2').remove();
        $('img').each((_, img) => {
            if (/wp-content\/uploads/.test(img.attribs.src)) {
                img.attribs.src = img.attribs.src.replace(/(-\d+x\d+)/, '');
            }
        });

        return {
            title: item.title.rendered,
            description: $.html(),
            link: item.link,
            pubDate: parseDate(item.date_gmt),
        };
    });

    ctx.set('data', {
        title: `${category ? `${categoryMap[category].title} | ` : ''}美国留学就业生活攻略`,
        link: currentUrl,
        item: items,
    });
};
