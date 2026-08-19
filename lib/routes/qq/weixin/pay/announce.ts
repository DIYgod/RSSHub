import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weixin/pay/announce',
    categories: ['programming'],
    example: '/qq/weixin/pay/announce',
    name: '微信支付 - 商户平台公告',
    maintainers: ['phantomk'],
    handler,
};

async function handler() {
    const now = Math.floor(Date.now() / 1000);
    const query = {
        id: '6200',
        cmstype: '1',
        url: encodeURIComponent('https://pay.weixin.qq.com/public/cms/content_list?lang=zh&id=6200'),
        states: '2',
        publishtimeend: now,
        expiretimebeg: now,
        ordertype: '4',
        field: 'contentId,contentTitle,contentPublishTime',
        g_ty: 'ajax',
    };
    const [response, response2] = await Promise.all([
        ofetch('https://pay.weixin.qq.com/index.php/public/cms/get_contents', { query: { ...query, propertyinclude: '1' } }),
        ofetch('https://pay.weixin.qq.com/index.php/public/cms/get_contents', { query: { ...query, pagenum: '1', propertyexclude: '1' } }),
    ]);
    const data = [...response.data.contentlist, ...response2.data.contentlist];

    const list = data.map((item): DataItem & { link: string; contentId: number } => ({
        title: item.contentTitle,
        pubDate: parseDate(item.contentPublishTime, 'X'),
        link: `https://pay.weixin.qq.com/index.php/public/cms/content_detail?platformType=0&lang=zh&id=${item.contentId}`,
        contentId: item.contentId,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await ofetch('https://pay.weixin.qq.com/index.php/public/cms/get_content', { query: { id: item.contentId, g_ty: 'ajax' } });
                item.description = Buffer.from(detail.data.content, 'base64').toString();
                return item;
            })
        )
    );

    return {
        title: '微信支付-商户平台公告',
        link: 'https://pay.weixin.qq.com/public/cms/content_list?lang=zh&id=6200',
        item: items,
    };
}
