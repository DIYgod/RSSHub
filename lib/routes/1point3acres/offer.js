const got = require('@/utils/got');

module.exports = async (ctx) => {
    // let out = '';
    // const { id } = ctx.params;
    // const { year } = ctx.params.year || 'null';
    // year 2017-2022
    // 2017:6   2018:11   2019:12   2020:13   2021:14   2022:15
    // const { major } = ctx.params.major || 'null';
    // CS:1     MIS:2
    // const { school } = ctx.params.school || 'null';
    const year = ctx.params.year || 'null';
    const major = ctx.params.major || 'null';
    const school = ctx.params.school || 'null';
    // school == 'null' ? outname_w : 'CMU'
    const url = 'https://api.1point3acres.com/offer/results?ps=15&pg=1';
    // const filter = '{"filters": {"planyr": "12", "planmajor": "1", "outname_w": "CMU"}}';
    // const filter = 'filters: {planyr: "12", planmajor: "1", outname_w: "CMU"}';
    let responseBasic;
    // eslint-disable-next-line eqeqeq
    if (year == 'null') {
        // eslint-disable-next-line eqeqeq
        if (major == 'null') {
            // eslint-disable-next-line eqeqeq
            if (school == 'null') {
                // year空 major空 school空
                responseBasic = await got({
                    method: 'post',
                    url,
                    json: {
                        filters: {},
                    },
                });
            } else {
                // year空 major空 school不空
                responseBasic = await got({
                    method: 'post',
                    url,
                    json: {
                        filters: {
                            outname_w: school,
                        },
                    },
                });
            }
        } else {
            // year空 major不空
            // eslint-disable-next-line eqeqeq
            if (school == 'null') {
                // year空 major不空 school空
                responseBasic = await got({
                    method: 'post',
                    url,
                    json: {
                        filters: {
                            planmajor: major,
                        },
                    },
                });
            } else {
                // year空 major不空 school不空
                responseBasic = await got({
                    method: 'post',
                    url,
                    json: {
                        filters: {
                            planmajor: major,
                            outname_w: school,
                        },
                    },
                });
            }
        }
    } else {
        // eslint-disable-next-line eqeqeq
        if (major == 'null') {
            // eslint-disable-next-line eqeqeq
            if (school == 'null') {
                // year不空 major空 school空
                responseBasic = await got({
                    method: 'post',
                    url,
                    json: {
                        filters: {
                            planyr: year,
                        },
                    },
                });
            } else {
                // year不空 major空 school不空
                responseBasic = await got({
                    method: 'post',
                    url,
                    json: {
                        filters: {
                            planyr: year,
                            outname_w: school,
                        },
                    },
                });
            }
        } else {
            // eslint-disable-next-line eqeqeq
            if (school == 'null') {
                // year不空 major不空 school空
                responseBasic = await got({
                    method: 'post',
                    url,
                    json: {
                        filters: {
                            planyr: year,
                            planmajor: major,
                        },
                    },
                });
            } else {
                // year不空 major不空 school不空
                responseBasic = await got({
                    method: 'post',
                    url,
                    json: {
                        filters: {
                            planyr: year,
                            planmajor: major,
                            outname_w: school,
                        },
                    },
                });
            }
        }
    }
    const data = responseBasic.data.results;
    // data.id-> 访问offer具体信息->获取 data.tid
    // if (data.id !== 0) {
    //     out = await Promise.all(
    //         data.map(async (item) => {
    //             var gettidresponse = await got({
    //              method: 'get',
    //              url: 'https://api.1point3acres.com/offer/results/'+ item.id +  '/backgrounds',
    //              headers: {
    //                  authorization: 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTU3Njk5Njc5OSwiZXhwIjoxNTg0ODU5MTk5fQ.eyJ1aWQiOjQ1NzQyN30.0ei5UE6OgLBzN2_IS7xUIbIfW_S1Wzl42q2UeusbboxuzvctO_4Mz6YRr6f0PBLUVZMETxt8F0_4-yqIJ3_kUQ',
    //              },
    //          });
    //         var tid = gettidresponse.data.background.tid;
    //         //https: //www.1point3acres.com/bbs/thread-581177-1-1.html
    //         console.log(tid);
    //         const threadlink = 'https://www.1point3acres.com/bbs/thread-' + tid + '-1-1.html';
    //         console.log(threadlink);
    //         return threadlink;
    //         })
    //     );
    // }
    // let responseBasic_1;
    // responseBasic_1 = await got({
    //     method: 'get',
    //     url: `https://api.1point3acres.com/offer/results/A7m20e4g/backgrounds`,
    //     headers: {
    //         authorization: `eyJhbGciOiJIUzUxMiIsImlhdCI6MTU3Njk5Njc5OSwiZXhwIjoxNTg0ODU5MTk5fQ.eyJ1aWQiOjQ1NzQyN30.0ei5UE6OgLBzN2_IS7xUIbIfW_S1Wzl42q2UeusbboxuzvctO_4Mz6YRr6f0PBLUVZMETxt8F0_4-yqIJ3_kUQ`,
    //     },
    // });
    // const tid = responseBasic_1.data.background.tid;
    ctx.state.data = {
        title: `录取结果 - 一亩三分地`,
        link: `https://offer.1point3acres.com`,
        description: `录取结果 - 一亩三分地`,
        item: data.map((item) => ({
            title: item.planyr + `年` + item.planmajor + `@` + item.outname_w + ` ` + item.result + ` - 一亩三分地`, // `${year_result}年${major_result}@${outname_w_result} ${result_result}`,
            description:
                `<b>国家:</b>` +
                item.country +
                `<br>` +
                `<b>学校:</b>` +
                item.outname_w +
                ` ` +
                item.outname +
                '<br>' +
                `<b>录取学位:</b>` +
                item.plandegree +
                '<br>' +
                `<b>录取项目:</b>` +
                item.planmajor +
                `-` +
                item.planprogram +
                '<br>' +
                `<b>录取结果:</b>` +
                item.result +
                '<br>' +
                `<b>录取时间:</b>` +
                item.outtime +
                '<br>' +
                `<b>通知方式:</b>` +
                item.noticemethod +
                '<br>' +
                `<b>全奖/自费:</b>` +
                item.planfin +
                '<br>' +
                `<b>申入学学期:</b>` +
                item.planterm +
                '<br>' +
                `<b>申入学年度:</b>` +
                item.planyr +
                '<br>' +
                `<b>提交时间:</b>` +
                item.submittime +
                '<br>',
            // pubDate: new Date(item.submittime + ' GMT+8').toUTCString(),
            link: `https://offer.1point3acres.com`,
            // link: out,
        })),
    };
};
