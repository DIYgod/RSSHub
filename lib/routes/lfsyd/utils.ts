// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { load } from 'cheerio';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import * as path from 'node:path';
import { art } from '@/utils/render';

const rootUrl = 'https://www.iyingdi.com';
const infoUrL = 'https://api.iyingdi.com/web/post/info';

const ProcessFeed = async (cache, articleList) => {
    const items = await Promise.all(
        articleList.map((item) =>
            cache.tryGet(item.link, async () => {
                const infoForm = {
                    post_id: item.postId,
                    timestamp: '',
                };
                const { body } = await got({
                    method: 'post',
                    url: infoUrL,
                    headers: {
                        Host: 'api.iyingdi.com',
                        'Login-Token': 'nologin',
                        Origin: rootUrl,
                        Platform: 'pc',
                        Referer: `${rootUrl}/`,
                    },
                    form: ProcessForm(infoForm),
                });
                item.description = cleanHtml(JSON.parse(body).post.content);
                return item;
            })
        )
    );

    return items;
};

const ProcessForm = (form, type) => {
    const key = type ? '8a11ed3712b699e749185674f1dc20b4' : 'b8d5b38577b8bb382b0c783b474b95f9';
    form.key = key;
    form.timestamp = Math.floor(Date.now() / 1000);
    form.sign = md5(new URLSearchParams(form).toString());
    delete form.key;
    return form;
};

const cleanHtml = (htmlString) => {
    const regex = /(<p>|<div>)(.*?)?<strong>(标准|狂野)日报投稿.*?<\/strong>(.*?)?(<\/p>|<\/div>)(.|\n)*$/;
    const $ = load(htmlString.replace(regex, ''));

    $('.yingdi-car,.bbspost,.deck-set').each((i, e) => {
        const className = $(e).attr('class');
        const dataId = $(e).attr('data-id');
        const decksUrl = `${rootUrl}/web/tools/hearthstone/decks/setdetail?setid=${dataId}`;
        const url = className === 'yingdi-card bbspost' ? `${rootUrl}/tz/post/${dataId}` : decksUrl;
        const time = $(e).find('.card-status .time').text();
        $(e)
            .find('.card-info .title')
            .text((i, c) => `${c} ${time}`);
        $(e).find('.card-status').remove();
        $(e)
            .find('.card-info')
            .wrap(art(path.join(__dirname, 'templates/card.art'), { url }));
    });

    $('.yingdi-image.gif').each((i, e) => {
        const imgsrc = $(e).attr('data-original');
        $(e).attr('src', imgsrc);
    });

    $('.yingdi-audio').each((i, e) => {
        $(e).find('.audio-cover').remove();
        $(e).find('.audio-area.hidden').attr('class', 'audio-area');
    });

    $('.yingdi-video iframe').each((i, e) => {
        const bvid = $(e)
            .attr('src')
            .match(/bvid=(.*?)&/)[1];
        if (bvid) {
            const url = `https://www.bilibili.com/video/${bvid}`;
            $(e).after(art(path.join(__dirname, 'templates/video.art'), { url }));
        }
    });

    // 用户头像
    $('.yingdi-card.user').each((i, e) => {
        $(e).prev('p').remove();
        $(e).remove();
    });
    // 套牌代码复制
    $('.action-button').remove();
    // 投票
    $('.yingdi-ballot').remove();
    $('hr').remove();
    return $.html();
};

module.exports = {
    ProcessForm,
    ProcessFeed,
};
