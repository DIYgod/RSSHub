import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/programs',
    categories: ['shopping'],
    example: '/shcstheatre/programs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.shcstheatre.com/Program/programList.aspx'],
        },
    ],
    name: '节目列表',
    maintainers: ['fuzy112'],
    handler,
    url: 'www.shcstheatre.com/Program/programList.aspx',
};

async function handler() {
    const url = 'https://www.shcstheatre.com/Program/programList.aspx';
    const res = await got.get(url);
    const $ = load(res.data);
    const baseUrl = 'https://www.shcstheatre.com';
    const splitImages = (value?: string) =>
        value
            ?.split(';')
            .map((item) => item.trim())
            .filter(Boolean) ?? [];
    const renderDescription = (data) => {
        const {
            SCS_PC_YMXQ_PIC,
            SCS_WEBPERCYCLE,
            SCS_EINLASSNAME,
            SCS_PERFORMANCE_TYPENAME,
            SCS_LENGTH,
            SCS_PERLANGUAGENAME,
            SCS_PC_LUNBO_YCJS_EDITOR,
            SCS_PC_LUNBO_YCJS_PIC,
            SCS_PC_LUNBO_ZCTD_EDITOR,
            SCS_PC_LUNBO_ZCTD_PIC,
            SCS_PC_LUNBO_JQGG_EDITOR,
            SCS_PC_LUNBO_JQGG_PIC,
            SCS_PC_LUNBO_HJJL_EDITOR,
            SCS_PC_LUNBO_HJJL_PIC,
            SCS_PC_LUNBO_MTPL_EDITOR,
            SCS_PC_LUNBO_MTPL_PIC,
        } = data;

        return renderToString(
            <div>
                {splitImages(SCS_PC_YMXQ_PIC).map((src) => (
                    <img src={`${baseUrl}${src}`} />
                ))}

                <ul>
                    <li>演出日期：{SCS_WEBPERCYCLE}</li>
                    <li>入场时间：{SCS_EINLASSNAME}</li>
                    <li>演出类型：{SCS_PERFORMANCE_TYPENAME}</li>
                    <li>演出时长：{SCS_LENGTH}分钟</li>
                    <li>演出语言：{SCS_PERLANGUAGENAME}</li>
                </ul>

                {SCS_PC_LUNBO_YCJS_EDITOR ? (
                    <>
                        <h1>演出介绍</h1>
                        {splitImages(SCS_PC_LUNBO_YCJS_PIC).map((src) => (
                            <img src={`${baseUrl}${src}`} />
                        ))}
                        <div>{raw(SCS_PC_LUNBO_YCJS_EDITOR)}</div>
                    </>
                ) : null}

                {SCS_PC_LUNBO_ZCTD_EDITOR ? (
                    <>
                        <h1>主创团队</h1>
                        {splitImages(SCS_PC_LUNBO_ZCTD_PIC).map((src) => (
                            <img src={`${baseUrl}${src}`} />
                        ))}
                        <div>{raw(SCS_PC_LUNBO_ZCTD_EDITOR)}</div>
                    </>
                ) : null}

                {SCS_PC_LUNBO_JQGG_EDITOR ? (
                    <>
                        <h1>剧情梗概</h1>
                        {splitImages(SCS_PC_LUNBO_JQGG_PIC).map((src) => (
                            <img src={`${baseUrl}${src}`} />
                        ))}
                        <div>{raw(SCS_PC_LUNBO_JQGG_EDITOR)}</div>
                    </>
                ) : null}

                {SCS_PC_LUNBO_HJJL_EDITOR ? (
                    <>
                        <h1>获奖记录</h1>
                        {splitImages(SCS_PC_LUNBO_HJJL_PIC).map((src) => (
                            <img src={`${baseUrl}${src}`} />
                        ))}
                        <div>{raw(SCS_PC_LUNBO_HJJL_EDITOR)}</div>
                    </>
                ) : null}

                {SCS_PC_LUNBO_MTPL_EDITOR ? (
                    <>
                        <h1>媒体评论</h1>
                        {splitImages(SCS_PC_LUNBO_MTPL_PIC).map((src) => (
                            <img src={`${baseUrl}${src}`} />
                        ))}
                        <div>{raw(SCS_PC_LUNBO_MTPL_EDITOR)}</div>
                    </>
                ) : null}
            </div>
        );
    };

    const items = await Promise.all(
        $('#datarow .program-name a').map((_, elem) => {
            const link = new URL($(elem).attr('href'), url);
            return cache.tryGet(link.toString(), async () => {
                const id = link.searchParams.get('id');
                const res2 = await got.post('https://www.shcstheatre.com/webapi.ashx?op=GettblprogramCache', {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    form: { id },
                });
                const data = res2.data.data.tblprogram[0];
                return {
                    title: data.SCS_WEB_BRIEFNAME,
                    link: link.toString(),
                    description: renderDescription(data),
                    pubDate: timezone(parseDate(data.SJ_DATE_PC), +8),
                };
            });
        })
    );
    const image = $('.menu-logo img').attr('src');

    return {
        title: '上海文化广场 - 节目列表',
        link: url,
        image,
        item: items,
    };
}
