import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateStrict } from '@/utils/time';

const baseUrl = 'http://www.wsyu.edu.cn';

const typeMap = {
    xxyw: { name: '学校要闻', url: '/news/xxywzl/list.htm' },
    zhxw: { name: '综合新闻', url: '/news/zhxwzl/list.htm' },
    mtjj: { name: '媒体聚焦', url: '/news/mtjjzl/list.htm' },
};

const parseSourceDate = (raw?: string) => {
    if (!raw) {
        return;
    }
    const normalized = raw.trim().replaceAll(/\s+/g, ' ');
    return parseDateStrict(normalized, normalized.length === 10 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss', 8);
};

const fetchArticle = async (link: string): Promise<Pick<DataItem, 'description' | 'author' | 'pubDate'>> => {
    const { data } = await got(link);
    const $ = load(data);
    const internalBody = $('.wp_articlecontent');
    const body = internalBody.length ? internalBody : $('#detailContent');
    const authors = internalBody.length
        ? body
              .find('p')
              .toArray()
              .flatMap((element) => {
                  const paragraph = $(element);
                  const text = paragraph.text().replaceAll(/\s+/g, ' ').trim();
                  const writer = text.match(/^(?:教工通讯员|学生通讯员|通讯员|记者)\s+(\S.*)$/);
                  if (writer) {
                      paragraph.remove();
                      return [writer[1]];
                  }
                  if (/^编辑\s+\S/.test(text)) {
                      paragraph.remove();
                  }
                  return [];
              })
        : [];
    const sourceDate = internalBody.length
        ? $('.arti_info')
              .text()
              .match(/发布时间：(\d{4}-\d{2}-\d{2})/)?.[1]
        : $('.info')
              .text()
              .match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/)?.[0];
    const pubDate = parseSourceDate(sourceDate);
    return {
        ...(body.length && { description: body.html() }),
        ...(authors.length && { author: authors.join(', ') }),
        ...(pubDate && { pubDate }),
    };
};

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/wsyu/news/xxyw',
    parameters: { type: '分类，默认为 `xxyw`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻中心',
    maintainers: ['Derekmini'],
    handler,
    description: `| 学校要闻 | 综合新闻 | 媒体聚焦 |
| -------- | -------- | -------- |
| xxyw     | zhxw     | mtjj     |`,
};

async function handler(ctx: Context) {
    const type = (ctx.req.param('type') || 'xxyw') as keyof typeof typeMap;
    const config = typeMap[type];
    if (!config) {
        throw new Error(`Unsupported news type: ${type}`);
    }
    const link = baseUrl + config.url;
    const { data } = await got(link);
    const $ = load(data);
    const list = $('.news_title a')
        .slice(0, 10)
        .toArray()
        .map((element): DataItem & { link: string } => {
            const anchor = $(element);
            const card = anchor.parent().parent();
            return {
                title: anchor.attr('title') ?? anchor.text(),
                link: new URL(anchor.attr('href')!, link).href,
                description: card.find('.news_text a').html(),
                pubDate: parseSourceDate(card.find('.news_date').text()),
            };
        });
    const items = await pMap(list, async (item) => ({ ...item, ...(await cache.tryGet(item.link, () => fetchArticle(item.link))) }), { concurrency: 3 });
    return {
        title: `武昌首义学院-${config.name}`,
        link,
        item: items,
    };
}
