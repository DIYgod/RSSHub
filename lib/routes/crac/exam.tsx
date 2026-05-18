import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/exam',
    categories: ['government'],
    example: '/crac/exam',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '考试信息',
    maintainers: ['admxj'],
    radar: [
        {
            source: ['www.crac.org.cn/*'],
            target: '/exam',
        },
    ],
    handler,
};

async function handler() {
    const baseUrl = 'http://82.157.138.16:8091/CRAC';

    const response = await got({
        method: 'post',
        url: `${baseUrl}/app/exam_advice/examAdviceList`,
        body: { req: { type: '0', page_no: '1', page_size: '10' } },
    });

    const list = response.data.res.list.map((item) => {
        const id = Buffer.from(item.id).toString('base64');
        const type = Buffer.from(item.type).toString('base64');
        const link = `${baseUrl}/crac/pages/list_detail.html?id=${id}&type=${type}`;
        return {
            title: item.name,
            link,
            id: item.id,
            author: item.exam.organizer,
            pubDate: item.createDate,
            updated: item.updateDate,
            startDate: item.exam.signUpStartDate,
            category: [item.examType],
            image: item.weixin,
            description: renderToString(<ExamDescription item={item} />),
        };
    });
    return {
        title: '考试信息-中国无线电协会业余无线电分会',
        link: 'http://82.157.138.16:8091/CRAC/crac/pages/list_examMsg.html',
        item: list,
    };
}

const ExamDescription = ({ item }: { item: any }) => (
    <div class="notice-info">
        <table class="exam-table" id="exam_table" style="width: 90%;margin: 30px auto 0;border: 1px solid #e2e5ef;">
            <tr>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">组织者：</th>
                <td>{item.exam.organizer}</td>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">报名开始日期：</th>
                <td>{item.exam.signUpStartDate}</td>
            </tr>
            <tr>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">报名截止日期：</th>
                <td>{item.exam.signUpEndDate}</td>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">补充材料截止日期：</th>
                <td>{item.exam.supplementEndDate}</td>
            </tr>
            <tr>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">考试日期：</th>
                <td>{item.exam.examDate}</td>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">最多参考人数：</th>
                <td>{item.exam.maxNum}</td>
            </tr>
            <tr>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">联系方式：</th>
                <td>{item.exam.telephone}</td>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">考试方式：</th>
                <td>{item.exam.mode === 0 ? '机上考试' : '纸上考试'}</td>
            </tr>
            <tr>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">考试类型：</th>
                <td>{item.exam.type}类</td>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">考试地点：</th>
                <td>{item.exam.examArea}</td>
            </tr>
            <tr>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">电子邮箱：</th>
                <td>{item.exam.email}</td>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">备注：</th>
                <td>{item.exam.remarks}</td>
            </tr>
            <tr>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;">微信群二维码：</th>
                <td>
                    <img src={item.exam.weixin} style="width: auto;height: 100px;" />
                </td>
                <th style="width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;"></th>
                <td></td>
            </tr>
        </table>
        <div class="content" id="detail_content">
            {item.content ? raw(item.content) : null}
        </div>
    </div>
);
