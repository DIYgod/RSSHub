// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
const { CookieJar } = require('tough-cookie');

export default async (ctx) => {
    const baseUrl = 'https://www.parliament.go.th/section77';
    const { type = '' } = ctx.req.param();
    const cookieJar = new CookieJar();

    let title = 'ร่างพระราชบัญญัติที่เปิดรับฟังความคิดเห็นตามมาตรา 77 ของรัฐธรรมนูญ';

    if (type) {
        const [presenter, isMonetaryAct = ''] = type.split('-');

        title +=
            {
                presentbymp: 'ที่เสนอโดยสมาชิกสภาผู้แทนราษฏร',
                presentbyperson: 'ที่เสนอโดยประชาชน',
                openwsu: 'ที่กำลังเปิดรับฟังความคิดเห็น',
                closewsu: 'ที่ปิดรับฟังความคิดเห็น',
                reportwsu: ' รายงานผลการรับฟังความคิดเห็น',
                substatus1: 'ซึ่งรอคำรับรองจากนายกรัฐมนตรี',
                substatus2: 'ที่บรรจุเข้าระเบียบวาระ',
                substatus3: 'ที่พิจารณาแล้ว',
                closewsubypm: 'ที่นายกฯ ไม่รับรอง',
            }[presenter] ?? '';

        title +=
            {
                m: ' (ประธานสภาผู้แทนราษฎรวินิจฉัยว่า เป็นร่างการเงิน)',
                nm: ' (ประธานสภาผู้แทนราษฎรวินิจฉัยว่า ไม่เป็นร่างการเงิน)',
            }[isMonetaryAct] ?? '';
    }

    const result = {
        title,
        link: `${baseUrl}/survey_more_news.php${type ? '?type=' + type : ''}`,
        language: 'th-th',
        item: [],
    };

    const queryParams = {
        page: 1,
        type,
    };
    if (type) {
        queryParams.type = type;
    }

    const url = `${baseUrl}/ajax/pagination.php?${new URLSearchParams(queryParams).toString()}`;
    const { data: response } = await got({
        url,
        cookieJar,
    });
    const $ = load(response);

    if ($.text() === 'ยังไม่มีข้อมูล') {
        return result;
    }

    const actList = $('div.item-77')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: `${baseUrl}/${item.find('a').attr('href')}`,
                category: item
                    .find('label')
                    .toArray()
                    .map((l) => $(l).text()),
            };
        });

    if (!actList.length) {
        return result;
    }

    const actListFull = await Promise.all(
        actList.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got({
                    url: item.link,
                    cookieJar,
                });
                const $ = load(response);

                // Select the first element with the class name 'comment-body'
                item.title = $('.title h5').first().text();
                item.author = $('.present-by')
                    .first()
                    .text()
                    .replaceAll(/^\s*เสนอโดย\s*/g, '');
                item.description = $('.des').first().html();

                // Act draft status
                const [, presenter, monetaryType] = $('.type77 h5').text().split(' ');
                item.category = [
                    ...item.category,
                    $('.container-fluid .bg-status .col-md-8.p-0 h5 span,a')
                        .toArray()
                        .map((statusElem) => $(statusElem).text()),
                    presenter,
                    monetaryType,
                ];

                const voteText = $('.row.bg-status .col-md-4.text-right').text().trim();
                const voteRegex = /^ผู้แสดงความคิดเห็น\s*(\d+)\s*คน\s*(\d+(?:\.\d+)?)%\s*(\d+(?:\.\d+)?)%/g.exec(voteText);

                if (voteRegex) {
                    const voteTotal = Number.parseInt(voteRegex[0]);
                    const upvotePercent = Number.parseFloat(voteRegex[1]);
                    const downvotePercent = Number.parseFloat(voteRegex[2]);

                    item.upvotes = Number.parseInt((upvotePercent / 100) * voteTotal);
                    item.downvotes = Number.parseInt((downvotePercent / 100) * voteTotal);
                }

                const dateText = $('.banner-detail .banner-detail-caption .blockquote p:last-child').text();
                const dateRegex = /^รับฟังตั้งแต่วันที่\s(\d{1,2})\s*([\u0E00-\u0E7F]+)\s*(\d{4})/g.exec(dateText);

                if (dateRegex) {
                    item.pubDate = timezone(
                        new Date(
                            Number.parseInt(dateRegex[3]) - 543,
                            {
                                มกราคม: 0,
                                กุมภาพันธ์: 1,
                                มีนาคม: 2,
                                เมษายน: 3,
                                พฤษภาคม: 4,
                                มิถุนายน: 5,
                                กรกฎาคม: 6,
                                สิงหาคม: 7,
                                กันยายน: 8,
                                ตุลาคม: 9,
                                พฤศจิกายน: 10,
                                ธันวาคม: 11,
                            }[dateRegex[2].trim()],
                            Number.parseInt(dateRegex[1])
                        ),
                        +7
                    );
                }

                // Every property of a list item defined above is reused here
                // and we add a new property 'description'
                return item;
            })
        )
    );

    if (!actListFull.length) {
        return result;
    }

    result.item = actListFull;

    ctx.set('data', result);
};
