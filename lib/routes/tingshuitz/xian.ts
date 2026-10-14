import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/xian',
    categories: ['forecast'],
    example: '/tingshuitz/xian',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '西安市',
    maintainers: ['ciaranchen'],
    handler,
};
async function handler() {
    const url = 'http://www.xazls.com/tsgg/index.htm';
    const response = await got(url, {
        responseType: 'buffer',
    });
    const data = response.data;
    const $ = load(iconv.decode(data, 'gb2312'));
    const list = $('#body > div.M > div.AboutUsDetail > ul > li');
    return {
        title: $('title').text() || '停水通知 - 西安市自来水有限公司',
        link: 'http://www.xazls.com/tsgg/index.htm',
        item: list.toArray().map((el) => {
            const item = $(el);
            const a = item.find('a');
            const description = copyContent(item, $);
            description.find('a').remove();
            return {
                title: a.text(),
                description: description.text().trim() || undefined,
                link: 'http://www.xazls.com' + a.attr('href'),
            };
        }),
    };
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
