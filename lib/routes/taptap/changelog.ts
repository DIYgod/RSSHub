// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { getRootUrl, appDetail, X_UA } = require('./utils');

export default async (ctx) => {
    const is_intl = ctx.req.url.indexOf('/intl/') === 0;
    const id = ctx.req.param('id');
    const lang = ctx.req.param('lang') ?? (is_intl ? 'en_US' : 'zh_CN');

    const url = `${getRootUrl(is_intl)}/app/${id}`;

    const app_detail = await appDetail(id, lang, is_intl);

    const app_img = app_detail.app.icon.original_url;
    const app_name = app_detail.app.title;
    const app_description = `${app_name} by ${app_detail.app.developers.map((item) => item.name).join(' & ')}`;

    const response = await got({
        method: 'get',
        url: `${getRootUrl(is_intl)}/webapiv2/apk/v1/list-by-app?app_id=${id}&from=0&limit=10&${X_UA(lang)}`,
        headers: {
            Referer: url,
        },
    });

    const list = response.data.data.list;

    ctx.set('data', {
        title: `TapTap 更新记录 ${app_name}`,
        description: app_description,
        link: url,
        image: app_img,
        item: list.map((item) => ({
            title: `${app_name} / ${item.version_label}`,
            description: item.whatsnew.text,
            pubDate: parseDate(item.update_date * 1000),
            link: url,
            guid: item.version_label,
        })),
    });
};
