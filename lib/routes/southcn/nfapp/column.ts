import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseArticle } from './utils';

export const route: Route = {
    path: '/nfapp/column/:column?',
    categories: ['traditional-media'],
    example: '/southcn/nfapp/column/38',
    parameters: { column: '栏目或南方号 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '南方 +（按栏目 ID）',
    maintainers: ['TimWu007'],
    handler,
    description: `:::tip
  若此处输入的是栏目 ID（而非南方号 ID），则该接口会返回与输入栏目相关联栏目的文章。例如，输入栏目 ID \`38\`（广州），则返回的结果还会包含 ID 为 \`3547\`（市长报道集）的文章。
  :::

  1.  \`pc.nfapp.southcn.com\` 下的文章页面，可通过 url 查看，例：\`http://pc.nfapp.southcn.com/13707/7491109.html\` 的栏目 ID 为 \`13707\`。
  2.  \`static.nfapp.southcn.com\` 下的文章页面，可查看网页源代码，搜索 \`columnid\`。
  3.  [https://m.nfapp.southcn.com/column/all](https://m.nfapp.southcn.com/column/all) 列出了部分栏目，\`id\` 即为栏目 ID。`,
};

async function handler(ctx) {
    const columnId = ctx.req.param('column') ?? 38;

    const getColumnDetail = `https://api.nfapp.southcn.com/nanfang_if/getColumn?columnId=${columnId}`;
    const { data: responseColumn } = await got(getColumnDetail);
    const columnName = responseColumn.columnName === '' ? `南方+` : `南方+ - ${responseColumn.columnName}`;
    const columnLink = responseColumn.linkUrl === '' ? `https://m.nfapp.southcn.com/${columnId}` : responseColumn.linkUrl;

    /* Notes of columnLink:
    1) 南方号 uses responseColumn.linkUrl, e.g. https://static.nfapp.southcn.com/nfh/shareNFNum/index.html?nfhId=3392;
    2) 栏目/频道's responseColumn.linkUrl is empty, we use its subpage on 南方+ mobile site, e.g. https://m.nfapp.southcn.com/38;
    3) But https://m.nfapp.southcn.com/${columnId} may still be invalid for some higher-level columns, e.g. 20.
    */

    const getArticleList = `https://api.nfapp.southcn.com/nfplus-manuscript-web/article/list?columnId=${columnId}&nfhSubCount=1&pageNum=1&pageSize=20`; // this api only returns up to 20 articles
    const { data: responseArticle } = await got(getArticleList);
    const list = responseArticle.data.list
        .filter((i) => i.articleType === 0)
        .map((item) => ({
            title: '【' + item.columnName + '】' + item.title,
            description: art(path.join(__dirname, '../templates/description.art'), {
                thumb: item.picMiddle,
                description: item.summary === '详见内文' ? '' : item.summary,
            }),
            pubDate: timezone(parseDate(item.updateTime), +8),
            link: `http://pc.nfapp.southcn.com/${item.columnId}/${item.articleId}.html`,
            articleId: item.articleId,
            shareUrl: item.shareUrl,
        }));

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: columnName,
        link: columnLink,
        item: items,
    };
}
