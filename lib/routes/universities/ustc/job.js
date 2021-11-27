const got = require('@/utils/got');

const titles = {
    RecruitList: '专场招聘会',
    Doublechoice: '校园双选会',
    Broadcast: '空中宣讲',
    joblist2: '招聘公告',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'joblist2';

    const rand = 0.01234567890123456;
    const apiRootUrl = 'http://ustc.ahbys.com';
    const rootUrl = 'http://www.job.ustc.edu.cn';

    const currentUrl = `${rootUrl}/${category}.html`;

    const response = await got({
        method: (() => {
            switch (category) {
                case 'RecruitList':
                case 'Broadcast':
                case 'joblist2':
                    return 'get';
                case 'Doublechoice':
                    return 'post';
            }
        })(),

        url: (() => {
            switch (category) {
                case 'RecruitList':
                    return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}&pagesize=20&pageindex=1&action=bookinglist&kind=13`;
                case 'Doublechoice':
                    return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}`;
                case 'Broadcast':
                    return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}&pagesize=20&pageindex=1&action=bookinglist2&kind=2`;
                case 'joblist2':
                    return `${apiRootUrl}/API/Web/index10358.ashx?action=joblist2&pagesize=50&pageindex=1&rand=${rand}`;
            }
        })(),

        form: (() => {
            switch (category) {
                case 'RecruitList':
                case 'Broadcast':
                case 'joblist2':
                    return {};
                case 'Doublechoice':
                    return {
                        pagesize: 15,
                        pageindex: 1,
                        action: 'recruitlist',
                        rand,
                    };
            }
        })(),

        allowGetBody: true,
    });

    const list = response.data.data.slice(0, 10).map((item) => {
        switch (category) {
            case 'RecruitList':
                return {
                    title: item.ID,
                    pubDate: new Date(item.HoldDate),
                    link: `${rootUrl}/Recruit.html?id=${item.ID}`,
                };
            case 'Doublechoice':
                return {
                    ID: item.ID,
                    title: item.Theme,
                    pubDate: new Date(item.HoldDate),
                    link: `${rootUrl}/R2.html?id=${item.ID}`,
                };
            case 'Broadcast':
                return {
                    title: item.ID,
                    pubDate: new Date(item.HoldDate),
                    link: `${rootUrl}/R2.html?id=${item.ID}`,
                };
            case 'joblist2':
                return {
                    title: item.JID,
                    pubDate: new Date(item.UpdateDate),
                    link: `${rootUrl}/Job2.html?jid=${item.JID}&cid=${item.CompanyID}`,
                };
            default:
                return {};
        }
    });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: (() => {
                        switch (category) {
                            case 'RecruitList':
                            case 'Broadcast':
                            case 'joblist2':
                                return 'get';
                            case 'Doublechoice':
                                return 'post';
                        }
                    })(),

                    url: (() => {
                        switch (category) {
                            case 'RecruitList':
                                return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}&action=bookinginfo&rid=${item.title}&rand=${rand}`;
                            case 'Doublechoice':
                                return `${apiRootUrl}/API/Web/index10358.ashx`;
                            case 'Broadcast':
                                return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}&action=binfo&rid=${item.title}&rand=${rand}`;
                            case 'joblist2':
                                return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}&action=jobinfo2&jid=${item.title}&rand=${rand}`;
                        }
                    })(),

                    form: (() => {
                        switch (category) {
                            case 'RecruitList':
                            case 'Broadcast':
                            case 'joblist2':
                                return {};
                            case 'Doublechoice':
                                return {
                                    pagesize: 100,
                                    pageindex: 1,
                                    action: 'recruitcompany',
                                    rid: item.ID,
                                    rand,
                                };
                        }
                    })(),

                    allowGetBody: true,
                });

                item.title = (() => {
                    switch (category) {
                        case 'RecruitList':
                        case 'Broadcast':
                            return detailResponse.data.Theme;
                        case 'Doublechoice':
                            return item.title;
                        case 'joblist2':
                            return detailResponse.data.JobName;
                    }
                })();

                item.description = (() => {
                    switch (category) {
                        case 'RecruitList':
                        case 'Broadcast':
                            return detailResponse.data.Description;

                        case 'Doublechoice': {
                            let tbody =
                                '<table><thead style="background-color: #f6f6ee"><tr>' +
                                '<th style="white-space: nowrap;">单位名称</th>' +
                                '<th style="white-space: nowrap;">展位号</th>' +
                                '<th>职位信息</th></tr><tr></tr></thead><tbody>';

                            for (const company of detailResponse.data.CompanyList) {
                                tbody += `<tr><td style="white-space:nowrap"><a style="color:#004276;font-size:14px;"'+
                                    'href="${rootUrl}/Company.html?cid=${company.CompanyID}" target="_blank">${company.CompanyName}</a></td>'+
                                    '<td style="white-space:nowrap">${item.nPos}</td><td>${item.JobList}</td></tr>`;
                            }

                            return `${tbody}</tbody></table>`;
                        }

                        case 'joblist2':
                            return detailResponse.data.PostionDesc;
                    }
                })();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${titles[category]} - 中国科学技术大学就业信息网`,
        link: currentUrl,
        item: items,
    };
};
