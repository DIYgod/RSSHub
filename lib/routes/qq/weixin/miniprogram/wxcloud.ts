import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/weixin/miniprogram/wxcloud/:caty?',
    categories: ['programming'],
    example: '/qq/weixin/miniprogram/wxcloud/cloud-sdk',
    parameters: { caty: '日志分类' },
    name: '云开发更新日志',
    maintainers: ['nczitzk'],
    description: `| 小程序基础库更新日志（云开发部分） | IDE 云开发 & 云控制台更新日志 | wx-server-sdk 更新日志 |
| ---------------------------------- | ----------------------------- | ---------------------- |
| cloud-sdk                          | ide                           | server-sdk             |`,
    handler,
};

async function handler(ctx: Context) {
    const { caty } = ctx.req.param();
    const link = `https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference/changelog${caty ? '-' + caty : ''}.html`;
    const response = await ofetch(link);
    const $ = load(response);
    const name = $('#docContent .content h2').text();

    return {
        title: name,
        link,
        item: caty
            ? $('#docContent .content h3')
                  .toArray()
                  .map((item) => {
                      const $item = $(item);
                      const title = $item.text().replaceAll(/[\s#|]/g, '');
                      const date = /\d{4}.\d{2}.\d{2}/.exec(title)?.[0];
                      return {
                          title,
                          description: $item.next().html(),
                          pubDate: date ? timezone(parseDate(date), 8) : undefined,
                          link: link + $item.find('a.header-anchor').attr('href'),
                      };
                  })
            : $('#docContent .custom')
                  .toArray()
                  .map((item) => {
                      $('#docContent .custom h2').remove();
                      const title = $('#docContent .custom h3')
                          .first()
                          .text()
                          .replaceAll(/[\s#|]/g, '');
                      const date = /\d{4}.\d{2}.\d{2}/.exec(title)?.[0];
                      return {
                          title,
                          description: $(item).html(),
                          pubDate: date ? timezone(parseDate(date), 8) : undefined,
                          link,
                      };
                  }),
        description: name,
    };
}
