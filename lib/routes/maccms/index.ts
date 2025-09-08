import { Result, Vod } from '@/routes/maccms/type';
import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

const render = (vod: Vod, link: string) => art(path.join(__dirname, 'templates/vod.art'), { vod, link });

export const route: Route = {
    path: '/:domain/:type?/:size?',
    categories: ['multimedia'],
    example: '/maccms/moduzy.net/2',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    parameters: {
        domain: '采集站域名，可选值如下表',
        type: '类别ID，不同采集站点有不同的类别规则和ID，默认为 0，代表全部类别',
        size: '每次获取的数据条数，上限 100 条，默认 30 条',
    },
    name: '最新资源',
    maintainers: ['hualiong'],
    description: `
::: tip
每个采集站提供的影视类别ID是不同的，即参数中的 \`type\` 是不同的。**可以先访问一次站点提供的采集接口，然后从返回结果中的 \`class\` 字段中的 \`type_id\`获取相应的类别ID**
:::

| 站名                | 域名                                             | 站名             | 域名                                               | 站名           | 域名                                            |
| ------------------- | ------------------------------------------------ | ---------------- | -------------------------------------------------- | -------------- | ----------------------------------------------- |
| 魔都资源网          | [moduzy.net](https://moduzy.net)                 | 华为吧影视资源站 | [hw8.live](https://hw8.live)                       | 360 资源站     | [360zy.com](https://360zy.com)                  |
| jkun 爱坤联盟资源网 | [ikunzyapi.com](https://ikunzyapi.com)           | 奥斯卡资源站     | [aosikazy.com](https://aosikazy.com)               | 飞速资源采集网 | [www.feisuzyapi.com](http://www.feisuzyapi.com) |
| 森林资源网          | [slapibf.com](https://slapibf.com)               | 天空资源采集网   | [api.tiankongapi.com](https://api.tiankongapi.com) | 百度云资源     | [api.apibdzy.com](https://api.apibdzy.com)      |
| 红牛资源站          | [www.hongniuzy2.com](https://www.hongniuzy2.com) | 乐视资源网       | [leshiapi.com](https://leshiapi.com)               | 暴风资源       | [bfzyapi.com](https://bfzyapi.com)              |`,
    handler: async (ctx) => {
        const { domain, type = '0', size = '30' } = ctx.req.param();
        if (!list.has(domain)) {
            throw new Error('非法域名！');
        }

        const res = await ofetch<Result>(`https://${domain}/api.php/provide/vod`, {
            parseResponse: JSON.parse,
            query: { ac: 'detail', t: type, pagesize: Number.parseInt(size) > 100 ? 100 : size },
        });

        const items: DataItem[] = res.list.map((each) => ({
            title: each.vod_name,
            image: each.vod_pic,
            link: `https://${domain}/vod/${each.vod_id}/`,
            guid: each.vod_play_url?.match(/https:\/\/.+?\.m3u8/g)?.at(-1),
            pubDate: timezone(parseDate(each.vod_time, 'YYYY-MM-DD HH:mm:ss'), +8),
            category: [each.type_name, ...each.vod_class!.split(',')],
            description: render(each, `https://${domain}/vod/${each.vod_id}/`) + each.vod_content,
        }));

        return {
            title: `最新${type !== '0' && items.length ? items[0].category![0] : '资源'} - ${domain}`,
            link: `https://${domain}`,
            allowEmpty: true,
            item: items,
        };
    },
};

const list = new Set(['moduzy.net', 'hw8.live', '360zy.com', 'ikunzyapi.com', 'aosikazy.com', 'www.feisuzyapi.com', 'slapibf.com', 'api.tiankongapi.com', 'api.apibdzy.com', 'www.hongniuzy2.com', 'leshiapi.com', 'bfzyapi.com']);
