// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    let language = ctx.req.param('language');
    let changelog = '';

    // 如果为空或选项以外的值，则设置默认值
    if (language === undefined || !(language === 'tw' || language === 'en')) {
        language = 'cn';
        changelog = '更新日志';
    }
    if (language === 'tw') {
        changelog = '更新日誌';
    }
    if (language === 'en') {
        changelog = 'Release Notes';
    }

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://${language}.eagle.cool/changelog`,
        headers: {
            Referer: `https://${language}.eagle.cool/`,
        },
    });

    // 使用 cheerio 加载返回的 HTML
    const data = response.data;
    const $ = load(data);

    const list = $('.version');

    ctx.set('data', {
        // 源标题
        title: `Eagle ${changelog}`,
        // 源链接
        link: `https://${language}.eagle.cool/changelog`,
        // 源说明
        description: `Eagle ${changelog}`,

        // 遍历此前获取的数据
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    // 对获取的日期进行格式化处理
                    function getDate() {
                        const str = item.find('.date').text();
                        let date = '';
                        if (language === 'cn' || language === 'tw') {
                            const patt = /\d+/g;
                            let result;
                            while ((result = patt.exec(str)) !== null) {
                                date += result + '-';
                            }
                            date = date.replaceAll(/-$/g, '');
                        } else if (language === 'en') {
                            date = str.replaceAll('RELEASED', '');
                        }
                        return date;
                    }

                    return {
                        title: item.find('.ver').text(),
                        description: item.find('.logs').html(),
                        link: `https://${language}.eagle.cool/changelog`,
                        pubDate: parseDate(getDate()),
                        guid: item.find('.ver').text(),
                    };
                })
                .get(),
    });
};
