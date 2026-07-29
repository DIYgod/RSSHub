import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

import defaults from './defaults';
import shortcuts from './shortcuts';

export const route: Route = {
    path: ['/*/*', '/:0?'],
    categories: ['university'],
    example: '/dut',
    name: '通用',
    maintainers: ['beautyyuyanli', 'nczitzk', 'ueiu'],
    handler,
    description: `订阅 **单级** 栏目如 [大连理工大学新闻网](https://news.dlut.edu.cn) 的 [头条关注](https://news.dlut.edu.cn/ttgz.htm) 分类栏目，分为 3 步：

1. 将 URL \`https://news.dlut.edu.cn/ttgz.htm\` 中 \`https://\` 与 \`.dlut.edu.cn/\` 中间的 \`news\` 作为 \`site\` 参数填入；
2. 将 \`https://news.dlut.edu.cn/\` 与 \`.htm\` 间的 \`ttgz\` 作为 \`category\` 参数填入；
3. 最终可获得 [\`/dut/news/ttgz\`](https://rsshub.app/dut/news/tzgg)。

订阅 **多级** 栏目如 [大连理工大学新闻网](https://news.dlut.edu.cn) 的 [人才培养](https://news.dlut.edu.cn/xwjj01/rcpy.htm) 分类栏目，同样分为 3 步：

1. 将 URL \`https://news.dlut.edu.cn/xwjj01/rcpy.htm\` 中 \`https://\` 与 \`.dlut.edu.cn/\` 中间的 \`news\` 作为 \`site\` 参数填入；
2. 把 \`https://news.dlut.edu.cn/\` 与 \`.htm\` 间 \`xwjj01/rcpy\` 作为 \`category\` 参数填入；
3. 最终可获得 [\`/dut/news/xwjj01/rcpy\`](https://rsshub.app/dut/news/xwjj01/rcpy)。

::: tip 小提示
大连理工大学大部分站点支持上述通用规则进行订阅。下方的大连理工大学相关路由基本适用于该规则，在其对应的表格中没有提及的分类栏目，可以使用上方的方法自行扩展。
:::

::: tip 小小提示
你会发现 [大连理工大学新闻网](https://news.dlut.edu.cn) 的 [人才培养](https://news.dlut.edu.cn/xwjj01/rcpy.htm) 分类栏目在下方 **新闻网** 参数表格中 \`category\` 参数为 \`rcpy\`，并非上面例子中给出的 \`xwjj01/rcpy\`。这意味着开发者对路由 \`/dut/news/xwjj01/rcpy\` 指定了快捷方式 \`/dut/news/rcpy\`。两者的效果是一致的。
:::`,
};

async function handler(ctx) {
    const site = ctx.params[0] ?? 'news';
    if (!isValidHost(site)) {
        throw new InvalidParameterError('Invalid site');
    }

    let items;
    let category = ctx.params[1] ?? (Object.hasOwn(defaults, site) ? defaults[site] : '');
    category = Object.hasOwn(shortcuts, site) && Object.hasOwn(shortcuts[site], category) ? shortcuts[site][category] : category;

    const rootUrl = `https://${site}.dlut.edu.cn`;
    const currentUrl = `${rootUrl}/${category}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    if (site === 'panjin') {
        items = $('a.news').slice(0, -4);
    } else if (site === 'fldpj') {
        items = $('li[id^="line_u9"]').find('a');
    } else {
        $('.Next, .rjxw_left, .pb_sys_common').remove();
        items = $('.txt, .itemlist, .wall, .list, .list01, .ny_list, .rjxw_right, .rj_yjs_con, .c_hzjl_list1, .winstyle67894, .winstyle80936, .winstyle50738, #lili').find('a');
    }

    items = items
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            const result = {
                link: item.attr('href').startsWith('http') ? item.attr('href') : `${rootUrl}/${item.attr('href').replace(/^[./]+/, '')}`,
            };

            if (site === 'fldpj') {
                result.title = item.find('em').text();
                result.pubDate = parseDate(item.find('span').text());
            } else {
                const dateRegex = /(\d{4}[/年-]\d{2}[/月-]\d{2})/;

                let dateMatch = item.parent().text().match(dateRegex);
                if (!dateMatch) {
                    dateMatch = item.parent().parent().text().match(dateRegex);
                }

                result.title = item.text().trim() === '' ? item.next().text() : item.text();
                if (dateMatch) {
                    result.pubDate = parseDate(dateMatch[1].replaceAll(/年|月/g, '-'));
                }
            }

            return result;
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.description = content('.v_news_content, .conbox').html();
                } catch {
                    // Fo example: http://dutdice.dlut.edu.cn/nry.jsp?urltype=news.NewsContentUrl&wbtreeid=1006&wbnewsid=9820
                    // do nothing to the cases which require fetching resources from the Intranet :P
                }
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
}
