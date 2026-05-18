import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const renderDetail = (jobs) =>
    renderToString(
        <div id="job_list">
            <p>招聘职位：</p>
            <table>
                <tr>
                    <th>职位名称</th>
                    <th>职位月薪</th>
                    <th>工作地点</th>
                    <th>专业需求</th>
                    <th>应聘条件</th>
                </tr>
                {jobs.map((job) => (
                    <tr>
                        <td width="50">{job.zwmc}</td>
                        <td width="50">{`${job.yxmc}/月`}</td>
                        <td width="50">{job.gzdz}</td>
                        <td width="70">{job.zyyqmc}</td>
                        <td width="125">{job.zwms}</td>
                    </tr>
                ))}
            </table>
        </div>
    );
const renderDesc = (intro) =>
    renderToString(
        <div id="description_box">
            <div id="brief_description">
                <p>{`招聘主题：${intro.zpzt}`}</p>
                <p>{`单位名称：${intro.dwmc}`}</p>
                <p>{`单位性质：${intro.xzyjmc}`}</p>
                <p>{`行业名称：${intro.hyyjmc}（${intro.hyejmc}）`}</p>
                <p>{`公司规模：${intro.rsgmmc}`}</p>
                <p>{`工作地点：${intro.szxmc} ${intro.xxdz}`}</p>
                <p>{`招聘截止日期：${intro.zpjzrq}`}</p>
                <p>{`简历投递邮箱：${intro.jltdyx}`}</p>
                <p>{`单位网站：${intro.dwwz}`}</p>
            </div>
            {raw(renderDetail(intro.zwxxList))}
            <div id="company_introduction">{raw(intro.zpxxEditor)}</div>
        </div>
    );

const descpPage = (link, cache) =>
    cache.tryGet(link, async () => {
        const data = await got({
            method: 'post',
            url: link,
        });
        const intro = data.data.data;

        return {
            title: `${intro.dwmc}（${intro.xzyjmc}）`,
            pubDate: parseDate(String(intro.fbrq)),
            description: renderDesc(intro),
            link: String(link.replace('data', 'view')),
        };
    });

export default { descpPage, renderDetail, renderDesc };
