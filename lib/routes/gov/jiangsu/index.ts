import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import { decodeHTML } from 'entities';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

function extractSourceByline(value: string): string | undefined {
    for (const marker of value.matchAll(/来源[：:]/g)) {
        const tail = value.slice(marker.index + marker[0].length).trimStart();
        const byline = tail.match(/^(.*?)(?:查看反馈|$)/);
        if (byline) {
            return byline[1].trim();
        }
    }
}

const homePage = 'http://www.jiangsu.gov.cn';

const categories = {
    'executive-meeting': 33716,
    'important-news': 60096,
    department: 60085,
    'city-county': 33718,
    documentation: 84242,
    'policy-interpretation': 32648,
    'normative-document': 66109,
    'legislative-opinion-collection': 69933,
    'opinion-collection': 83435,
    'information-publicity': 84258,
};

async function getItem(item: DataItem & { link: string }) {
    const detail = await cache.tryGet(item.link, async () => {
        const detailContent = await ofetch(item.link);
        let $ = load(detailContent);
        const articleLink = $('.zhaiyao a[href]').first().attr('href');
        if (articleLink) {
            const articleContent = await ofetch(new URL(articleLink, item.link).href);
            $ = load(articleContent);
        }
        const surveyContent = copyElements($('.jsurvey-td-xj-span').first());
        const surveyHeader = surveyContent.children('p').slice(0, 2);
        const surveyMetadata = surveyHeader.text();
        surveyHeader.filter((_, paragraph) => $(paragraph).text().trim() === $('title').text().trim() || /^(?:时间|发布日期)[：:]\s*\d{4}-/.test($(paragraph).text().trim())).remove();
        const pubDate = $('meta[name="PubDate"]').attr('content') || surveyMetadata.match(/(?:时间|发布日期)[：:]\s*(\d{4}-\d{1,2}-\d{1,2})/)?.[1];
        const publishedTime = $('meta[name="firstpublishedtime"]').attr('content');
        const keywords = $('meta[name="Keywords"]').attr('content');
        return {
            title: $('meta[name="ArticleTitle"]').attr('content'),
            description: $('#zoom').html() ?? $('.article_content, .wzy_con, #UCAP-CONTENT').first().html() ?? surveyContent.html() ?? undefined,
            author: $('meta[name="ContentSource"]').attr('content') || extractSourceByline(surveyMetadata),
            pubDate: pubDate ? timezone(parseDate(pubDate), 8) : publishedTime ? timezone(parseDate(publishedTime, 'YYYY-MM-DD-HH:mm:ss'), 8) : undefined,
            category: keywords?.split(/[,，\s]+/).filter(Boolean),
        };
    });
    return { ...item, ...detail, title: detail.title || item.title, pubDate: detail.pubDate ?? item.pubDate };
}

export const route: Route = {
    path: '/:category',
    categories: ['government'],
    example: '/gov/jiangsu/important-news',
    parameters: { category: '分类名，见下表' },
    name: '动态',
    maintainers: ['ocleo1'],
    description: `|   省政府常务会议  |    要闻关注    |  部门资讯  |   地方动态  |        政策解读       |
| :---------------: | :------------: | :--------: | :---------: | :-------------------: |
| executive-meeting | important-news | department | city-county | policy-interpretation |

|    政府信息公开制度   |    政策文件   |     规范性文件     |
| :-------------------: | :-----------: | :----------------: |
| information-publicity | documentation | normative-document |

|          立法意见征集          |      征集调查      |
| :----------------------------: | :----------------: |
| legislative-opinion-collection | opinion-collection |`,
    handler,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();

    if (!Object.hasOwn(categories, category)) {
        throw new InvalidParameterError(`Unsupported Jiangsu category: ${category}. Choose one of ${Object.keys(categories).join(', ')}.`);
    }
    const target = categories[category];

    const link = `${homePage}/col/col${target}/index.html`;
    const response = await ofetch(link);
    const html = response.includes('<record>') ? response : decodeHTML(response);
    const records = html
        .matchAll(/<record>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/record>/g)
        .toArray()
        .map((match) => match[1]);

    const items = records.map((record) => {
        const $item = load(record)('li');
        const $aTag = $item.find('a').first();
        const date = $item
            .text()
            .replaceAll(/\s/g, '')
            .match(/\d{4}-\d{2}-\d{2}/);

        return {
            title: $aTag.attr('title') || $aTag.text(),
            pubDate: date ? timezone(parseDate(date[0]), 8) : undefined,
            link: new URL($aTag.attr('href')!, link).href,
        };
    });

    const $ = load(response);
    const [siteName, categoryName] = $('head title').text().split(' ', 2);

    return {
        title: categoryName,
        link,
        description: `${categoryName} - ${siteName}`,
        item: await pMap(items, getItem, { concurrency: 3 }),
    };
}
