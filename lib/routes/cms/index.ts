import { Result, Vod } from '@/routes/cms/type';
import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';
import { getCurrentPath } from '@/utils/helpers';

const render = (vod: Vod, link: string) => art(path.join(getCurrentPath(import.meta.url), 'templates', 'vod.art'), { vod, link });

export const route: Route = {
    path: ':domain/:type?/:size?',
    categories: ['multimedia'],
    example: '/cms/moduzy.net/2',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    parameters: {
        domain: '采集站域名，通常采集站点会提供CMS的视频采集接口',
        type: '类别ID，不同采集站点有不同的类别规则和ID，默认为 0，代表全部类别',
        size: '每次获取的数据条数，上限 100 条，默认 30 条',
    },
    name: '最新资源',
    maintainers: ['hualiong'],
    description: `
:::tip
每个采集站提供的影视类别ID是不同的，即参数中的 \`type\` 是不同的。**可以先访问一次站点提供的采集接口，然后从返回结果中的 \`class\` 字段中的 \`type_id\`获取相应的类别ID**
:::`,
    handler: async (ctx) => {
        const { domain, type = '0', size = '30' } = ctx.req.param();

        const res = await ofetch<Result>(`https://${domain}/api.php/provide/vod`, {
            parseResponse: JSON.parse,
            query: { ac: 'detail', t: type, pagesize: Number.parseInt(size) > 100 ? 100 : size },
        });

        const items: DataItem[] = res.list.map((each) => ({
            title: each.vod_name,
            image: each.vod_pic,
            link: `https://${domain}/vod/${each.vod_id}/`,
            guid: each.vod_play_url?.match(/https:\/\/.+?\.m3u8/g)?.slice(-1)[0],
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
