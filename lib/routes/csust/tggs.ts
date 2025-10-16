import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/tggs',
    categories: ['university'],
    example: '/csust/tggs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.csust.edu.cn/tggs.htm', 'www.csust.edu.cn/'],
        },
    ],
    name: '通告公示',
    maintainers: ['powerfullz'],
    handler,
    url: 'www.csust.edu.cn/tggs.htm',
};

async function getNoticeContent(item) {
    const response = await got(item.link);
    const $ = load(response.body);

    const $content = $('.v_news_content');

    if ($content.length) {
        // 移除无用元素
        $content.find('script').remove();
        $content.find('style').remove();
        $content.find('.vsbcontent_end').remove();
        $content.find('iframe').remove();

        // 清理其他元素的样式属性，保留排版相关
        $content.find('*').each((_, elem) => {
            const $elem = $(elem);
            const style = $elem.attr('style');

            // 保留文本对齐和缩进相关的样式
            if (style) {
                const textAlign = style.match(/text-align:\s*(\w+)/)?.[1];
                const textIndent = style.match(/text-indent:\s*([\d.]+(?:px|em))/)?.[1];

                let newStyle = '';
                if (textAlign && ['left', 'center', 'right', 'justify'].includes(textAlign)) {
                    newStyle += `text-align: ${textAlign};`;
                }
                if (textIndent) {
                    newStyle += ` text-indent: ${textIndent};`;
                }

                if (newStyle) {
                    $elem.attr('style', newStyle.trim());
                } else {
                    $elem.removeAttr('style');
                }
            }

            // 移除其他无用属性
            $elem.removeAttr('class id');
        });

        item.description = $content.html() || item.title;
    } else {
        item.description = item.title;
    }

    return item;
}

async function handler() {
    const baseUrl = 'https://www.csust.edu.cn';
    const response = await got(`${baseUrl}/tggs.htm`);
    const $ = load(response.body);

    const items = $('.list ul li')
        .toArray()
        .map((item) => {
            const element = $(item);
            const title = element.find('.newTitle').text().trim();
            const linkRaw = element.find('a').attr('href');
            const dateText = element.find('.data1').text().trim();

            if (!linkRaw || !title) {
                return null;
            }

            const dateMatch = dateText.match(/发布时间\s*[:：]\s*(\d{4}-\d{1,2}-\d{1,2})/);
            const pubDate = dateMatch ? parseDate(dateMatch[1]) : null;

            const link = linkRaw.startsWith('http') ? linkRaw : `${baseUrl}${linkRaw}`;

            return {
                title,
                link,
                pubDate,
            };
        })
        .filter((item) => item !== null);

    const itemsWithContent = await Promise.all(
        items.map((item) =>
            cache.tryGet(item!.link, async () => {
                try {
                    return await getNoticeContent(item!);
                } catch {
                    return item!;
                }
            })
        )
    );

    return {
        title: '长沙理工大学 - 通告公示',
        link: `${baseUrl}/tggs.htm`,
        description: '长沙理工大学通告公示',
        item: itemsWithContent,
    };
}
