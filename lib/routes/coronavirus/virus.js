const got = require('@/utils/got');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(path.resolve('./'), 'tmp', 'virus_data.json');
const srcLink = 'https://3g.dxy.cn/newh5/view/pneumonia';
function getInner(str) {
    if (!str) {
        // console.error(`---start---\ngetInner fail.\n${str}\n---end---`);
        return;
    }
    if (str.substring(0, 3) === 'try') {
        const a = str.lastIndexOf('catch');
        const end = a - 1;
        const start = str.indexOf('=') + 1;
        return str.substring(start, end);
    }
}
function checkHanzi(str) {
    const hanziMatchResult = str.match(/[\u4E00-\u9FFF]+/g);
    if (hanziMatchResult) {
        return hanziMatchResult[0];
    } else {
        return;
    }
}
module.exports = async (ctx) => {
    // console.time("run time")
    // console.time("read")

    const $ = cheerio.load(
        await ctx.cache.tryGet(
            srcLink,
            async () => {
                // console.log(srcLink);
                const response = await got({
                    method: 'get',
                    url: srcLink,
                });
                return response.data;
            },
            300
        )
    );

    /* const $ = cheerio.load(
        await (async function (){const response = await got({
            method: 'get',
            url: srcLink,
        });
      // console.log(response.data)
        return response.data;})()
    ); */
    // console.timeEnd("read")
    // console.time("readFile")
    const oldData = (function(dataPath) {
        if (!fs.existsSync(path.dirname(dataPath))) {
            fs.mkdirSync(path.dirname(dataPath));
        } // 创建tmp目录
        if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, '');
        }
        const file = fs.readFileSync(dataPath).toString();
        if (file) {
            return JSON.parse(file);
        } else {
            return undefined;
        }
    })(dataPath);
    // console.timeEnd('readFile')

    // console.log(Statistics);
    const items = [],
        StatisticsRaw = getInner($('script#getStatisticsService').html()),
        AreaStatRaw = getInner($('script#getAreaStat').html());

    if (StatisticsRaw && AreaStatRaw) {
        // 检查是否获取成功
        const Statistics = JSON.parse(StatisticsRaw),
            AreaStat = JSON.parse(AreaStatRaw);

        /* let AreaStat;
            if(AreaStatRaw){
                AreaStat=JSON.parse(AreaStatRaw);
            } */
        const pubDate = new Date(
            (function(s) {
                if (!s.modifyime) {
                    // 处理打字错误
                    if (!s.modifyTime) {
                        return 0;
                    } else {
                        return s.modifyTime;
                    }
                } else {
                    s.modifyTime = s.modifyime;
                    return s.modifyime;
                }
            })(Statistics)
        );
        if (!oldData.Statistics) {
            oldData.Statistics = Statistics;
        }
        if (!oldData.AreaStat) {
            oldData.AreaStat = AreaStat;
        }

        const addUpdatedSign = function(dataStr) {
            if (Statistics[dataStr] === oldData.Statistics[dataStr]) {
                return Statistics[dataStr];
            } else {
                return Statistics[dataStr] + '   [有更新!]';
            }
        };

        const countAnalyze = function(raw) {
            // 全国 确诊 544 例 疑似 137 例 治愈 28 例 死亡 17 例
            // 全国：确诊 ([0-9]+) 例 疑似 ([0-9]+) 例 治愈 ([0-9]+) 例 死亡 ([0-9]+) 例
            const a = /确诊([ 0-9]+)例[ ,，]疑似([ 0-9]+)例[ ,，]治愈([ 0-9]+)例[ ,，]死亡([ 0-9]+)例(.{0,})/g.exec(raw);
            return a
                ? {
                      确诊: a[1].trim(),
                      疑似: a[2].trim(),
                      治愈: a[3].trim(),
                      死亡: a[4].trim(),
                      unknown: a[5],
                  }
                : -1;
        };
        Statistics._count = countAnalyze(Statistics.countRemark);

        items.push({
            title: `新型冠状病毒简报 (${pubDate.toLocaleString()})`, // 文章标题
            description: `<pre>距离上次更新:${(function(oldTime, newTime) {
                const ta = ((newTime - oldTime) / 60000).toString().split('.');
                return `${ta[0]}分钟${ta[1] ? parseInt(`.${ta[1]}` * 60) + '秒' : ''}`;
            })(new Date(oldData.Statistics.modifyTime), pubDate)}
                <br>传染源:${addUpdatedSign('infectSource')}  病原体:${addUpdatedSign('virus')}
                <br>传播途径:${addUpdatedSign('passWay')}
                <br>${addUpdatedSign('summary')}
                <br>${Statistics.countRemark}
                <br>${(function(oldData, newDataC, countAnalyze) {
                    if (!oldData._count) {
                        oldData._count = countAnalyze(oldData.Statistics.countRemark);
                    }
                    if (newDataC === -1) {
                        return '(!数据格式有更新!)';
                    }
                    if (oldData._count === -1) {
                        return '';
                    }
                    const oldDataC = oldData._count;
                    let str = '较上次更新:';
                    for (const i in newDataC) {
                        const t = newDataC[i] - oldDataC[i];
                        if (t !== 0) {
                            str += `${i}:${t}`;
                        }
                    }
                    return str;
                })(oldData, Statistics._count, countAnalyze)}
                ${(function(Statistics, addUpdatedSign) {
                    // 兼容未来可能添加的注记
                    let i = 1,
                        str = '';
                    while (!(Statistics[`remark${i}`] === undefined || Statistics[`remark${i}`] === '')) {
                        str += '<br>' + addUpdatedSign(`remark${i}`);
                        i++;
                    }
                    return str;
                })(Statistics, addUpdatedSign)}
                ${(function(dataProvince, oldDataProvince) {
                    // 处理传入参数
                    let subscribedProvinces = ctx.params.province;
                    if (subscribedProvinces) {
                        subscribedProvinces = subscribedProvinces.split('|');
                        let str = '<br> 关注的省份情况:';
                        const now = {},
                            old = {};
                        const convertFromCount = function(obj) {
                            return {
                                确认: obj.confirmedCount,
                                疑似: obj.suspectedCount,
                                治愈: obj.curedCount,
                                死亡: obj.deadCount,
                                unknown: obj.comment,
                            };
                        };
                        for (const item in subscribedProvinces) {
                            const resultHanzi = checkHanzi(subscribedProvinces[item]);
                            if (resultHanzi) {
                                subscribedProvinces[item] = resultHanzi;
                            } else {
                                break;
                            }
                            for (const id in dataProvince) {
                                if (subscribedProvinces[item] === dataProvince[id].provinceShortName) {
                                    // sample:确诊 444 例，疑似病例数待确认，治愈 28 例，死亡 17 例
                                    now[subscribedProvinces[item]] = convertFromCount(dataProvince[id]);
                                    old[subscribedProvinces[item]] = convertFromCount(oldDataProvince[id]);
                                    break;
                                }
                            }
                            // 检查now[subscribedProvinces[item]]是否为空
                            if (now[subscribedProvinces[item]]) {
                                const nowDataProccessed = now[subscribedProvinces[item]],
                                    oldDataProccessed = old[subscribedProvinces[item]],
                                    differ = {},
                                    strArray = [];
                                for (const dataName in nowDataProccessed) {
                                    if (dataName !== 'unknown') {
                                        differ[dataName] = nowDataProccessed[dataName] - oldDataProccessed[dataName];
                                        strArray.push(`${dataName}:${nowDataProccessed[dataName]}${differ[dataName] === 0 ? '' : `(${differ[dataName]})`} 例`);
                                    }
                                }
                                if (nowDataProccessed.unknown) {
                                    strArray.push(`(${nowDataProccessed.unknown})`);
                                }
                                str += `<br> ${subscribedProvinces[item]}: ${strArray.join('，')}`;
                            } else {
                                str += `<br> ${subscribedProvinces[item]}：无数据。`;
                            }
                        }
                        return str;
                    } else {
                        return '';
                    }
                })(AreaStat, oldData.AreaStat)}
                ${/* (function(dataArea,oldDataArea){
                    if(!oldDataArea){
                        oldData.AreaStat=AreaStat//兼容旧格式
                    }

                })(AreaStat,oldData.AreaStat) TODO*/ ''}
                </pre><br><p>疫情地图:</p>
                <img src=${Statistics.imgUrl} referrerpolicy="no-referrer">`,
            pubDate: pubDate.toUTCString(),
            guid: `brief${pubDate.getTime()}`,
            link: srcLink,
        });
        fs.writeFile(
            dataPath,
            JSON.stringify({
                Statistics: Statistics,
                AreaStat: AreaStat,
            }),
            function(err) {
                if (err) {
                    // console.error(err);
                }
            }
        );
    } else {
        items.push({
            title: '错误:解析失败',
            author: '',
            category: '',
            description: 'script#getStatisticsService:' + $('script#getStatisticsService').html() + '  script#getAreaStat:' + $('script#getAreaStat').html(),
            pubDate: Date.now().toString(),
            guid: 'err' + Date.now().toString(),
            link: srcLink,
        });
    }
    ctx.state.data = {
        title: '新型冠状病毒疫情概况(数据源:丁香医生)',
        link: srcLink,
        item: items,
    };
    // console.timeEnd('run time')
};
