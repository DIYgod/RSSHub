import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const products = {
    'geos-col-irx': { name: '全球静止卫星 - 长波红外通道增强', xml: 'GEOS/GEOS_COL_IRX.xml', video: 'GEOS/COL/IRX/VIDEO/GEOS.COL.IRX.GBAL' },
    'geos-mos-irx': { name: '全球静止卫星 - 长波红外通道彩色合成', xml: 'GEOS/GEOS_MOS_IRX.xml', video: 'GEOS/MOS/IRX/VIDEO/GEOS.MOS.IRX.GBAL' },
    'fy4b-gclr': { name: '风云四号 B 星 - 真彩色合成', xml: 'FY4B/FY4B_AGRI_IMG_DISK_GCLR_NOM.xml', video: 'FY4B/AGRI/GCLR/VIDEO/FY4B.disk.gclr' },
    'fy4b-swci': { name: '风云四号 B 星 - Sandwich 合成', xml: 'FY4B/FY4B_AGRI_IMG_DISK_SWCI_NOM.xml', video: 'FY4B/AGRI/SWCI/VIDEO/FY4B.disk.swci' },
};

export const route: Route = {
    path: '/cloud/:product?/:hours?',
    example: '/nsmc/cloud/geos-col-irx/24',
    parameters: { product: '产品：geos-col-irx、geos-mos-irx、fy4b-gclr 或 fy4b-swci，默认 geos-col-irx', hours: '视频覆盖的小时数：24、48、72 或 168，默认 24' },
    categories: ['forecast'],
    name: '卫星云图视频',
    maintainers: ['DIYgod'],
    radar: [{ source: ['www.nsmc.org.cn/nsmc/cn/image/video.html', 'www.nsmc.org.cn/nsmc/cn/image/'] }],
    handler,
    description: '订阅卫星云图视频更新。发布时间来自官方 XML 云图列表；视频文件由源站持续更新，条目标识包含观测时间。',
};

async function handler(ctx) {
    const product = ctx.req.param('product') || 'geos-col-irx';
    const hours = ctx.req.param('hours') || '24';
    if (!Object.hasOwn(products, product) || !['24', '48', '72', '168'].includes(hours)) {
        throw new InvalidParameterError('Use a supported cloud product and a video duration of 24, 48, 72 or 168 hours.');
    }
    const selected = products[product];
    const response = await ofetch(`https://img.nsmc.org.cn/PORTAL/NSMC/XML/${selected.xml}`);
    const $ = load(response, { xmlMode: true });
    const latest = $('image').first();
    const timestamp = latest.attr('time');
    const imageUrl = latest.attr('url');
    if (!timestamp || !imageUrl) {
        throw new Error('The satellite image index did not contain an observation time and image URL.');
    }
    const videoUrl = `https://img.nsmc.org.cn/CLOUDIMAGE/${selected.video}.${hours}h.mp4`;
    const poster = new URL(imageUrl, 'https://img.nsmc.org.cn').href;
    const link = 'https://www.nsmc.org.cn/nsmc/cn/image/index.html';
    return {
        title: `${selected.name} - ${hours} 小时云图视频`,
        link,
        language: 'zh-CN' as const,
        item: [
            {
                title: `${selected.name} ${timestamp}`,
                link: videoUrl,
                guid: `${videoUrl}#${timestamp}`,
                pubDate: parseDate(timestamp.replace(' (UTC)', 'Z')),
                description: `<video controls poster="${poster}" src="${videoUrl}"></video>`,
                enclosure_url: videoUrl,
                enclosure_type: 'video/mp4',
            },
        ],
    };
}
