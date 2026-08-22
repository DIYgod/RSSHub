import type { Context } from 'hono';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { createClient, division, link, parentOf } from './utils';

export const route: Route = {
    path: '/95598/blackoutNotice/:adcode',
    categories: ['forecast'],
    example: '/sgcc/95598/blackoutNotice/320100',
    parameters: {
        adcode: '地区代码，可通过 `/sgcc/95598/helper` 查询',
    },
    radar: [
        {
            source: ['www.95598.cn/osgweb/blackoutNotice'],
        },
    ],
    name: '停电通知',
    maintainers: ['ocleo1'],
    handler,
    url: 'www.95598.cn/osgweb/blackoutNotice',
};

async function handler(ctx: Context) {
    const { adcode } = ctx.req.param();

    const siblings = await division(parentOf(adcode));
    const region = siblings.find((item) => item.codeValue === adcode);
    if (!region) {
        throw new Error(`95598 serves no region with code ${adcode}, look up a valid code via /sgcc/95598/helper`);
    }

    const client = await createClient();
    const notices = await client.post('/osg-web0004/member/c4/f08', {
        target: region.content3,
        source: '0901',
        serviceCode: '0104514',
        data: {
            orgNo: region.content2,
            powerCutNo: '',
            pageSize: '20',
            pageNo: 1,
            keyWord: '',
            areaNo: adcode,
        },
    });

    const items = notices.data.powerCutList.map((item) => ({
        title: `${item.powerType}｜${item.startTime} 至 ${item.stopTime}`,
        description: `停电范围：${item.powerRange}<br>停电设备：${item.powerArea}<br>停电线路：${item.powerCircuit}<br>停电原因：${item.powerCause}`,
        link,
        category: [item.takeType, item.powerType],
        guid: item.poweroffId,
        pubDate: timezone(parseDate(item.startTime), 8),
    }));

    return {
        title: `${region.codeName}停电通知`,
        link,
        language: 'zh-CN' as const,
        item: items,
    };
}
