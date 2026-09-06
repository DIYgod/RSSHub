import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/recommend/:annotation?',
    categories: ['other'],
    example: '/gushiwen/recommend/zhushang',
    parameters: { annotation: '添加哪些附加信息' },
    name: '首页推荐',
    maintainers: ['LogicJake'],
    description: `\`annotation\` 字段为添加哪些附加信息。可从以下表格中选择值后按顺序拼接。例如如果需要注释和赏析，则为\`zhushang\`。

| 翻译 | 注释 | 赏析  |
| ---- | ---- | ----- |
| yi   | zhu  | shang |`,
    handler,
};

const idPattern = /230427\('\w+','(\w+)'\)/;

function getContent(onclick: string, annotation: string) {
    const id = onclick.match(idPattern)![1];
    return ofetch(`https://www.gushiwen.cn/nocdn/ajaxshiwenDetailCont.aspx?id=${id}&value=${annotation}`, { headers: { cookie: 'login=flase' } });
}

async function handler(ctx: Context) {
    const url = 'https://www.gushiwen.cn/';
    const res = await ofetch(url);
    const { annotation } = ctx.req.param();
    const $ = load(res);

    const out = await Promise.all(
        $('div.sons:has(div.contson)')
            .slice(0, 10)
            .toArray()
            .map((item) => {
                const $item = $(item);
                const href = $item.find('p a').attr('href');
                const link = href ? new URL(href, url).href : undefined;

                return cache.tryGet(`gushiwen:recommend:${link}:${annotation ?? ''}`, async () => {
                    let description = $item.find('div.contson').html();
                    const onclick = $item.find('img[onclick]').attr('onclick');
                    if (annotation && onclick) {
                        description = await getContent(onclick, annotation);
                    }

                    return {
                        title: $item.find('b').text(),
                        link,
                        description,
                        author: $item.find('p.source').text(),
                    };
                });
            })
    );

    return {
        title: '古诗文推荐',
        link: url,
        item: out,
    };
}
