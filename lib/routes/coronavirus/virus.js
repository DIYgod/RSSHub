const got = require('@/utils/got');
const cheerio = require('cheerio');
const fs = require("fs");
const path = require('path');
const dataPath = path.join(path.resolve("./"), "tmp", "virus_data.json");
const srcLink = `https://3g.dxy.cn/newh5/view/pneumonia`;

module.exports = async (ctx) => {
    console.time("run time")
    console.time("read")
    const response = await got({
        method: 'get',
        url: srcLink,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    console.timeEnd("read")
    function getJSON(str) {
        if (!str) {
            console.error(`---start---\ngetJSON fail.\n${str}\n---end---`);
        }
        if (str.substring(0, 3) == "try") {
            const a = str.lastIndexOf("catch");
            const end = a - 1;
            const start = (str.indexOf("=") + 1);
            return str.substring(start, end);
        }
    };

    const Statistics = JSON.parse(getJSON($('script#getStatisticsService').html()));
    const ListByCountryTypeService1 = JSON.parse(getJSON($('script#getListByCountryTypeService1').html()));
    if (!fs.existsSync(path.dirname(dataPath))) {fs.mkdirSync(path.dirname(dataPath));}// 创建tmp目录
    if (!fs.existsSync(dataPath)) {fs.writeFileSync(dataPath, "");}
    let oldData;
    const file = fs.readFileSync(dataPath).toString();
    if (file != "") {
        oldData = JSON.parse(file);
    }
    // console.log(Statistics);
    const items = [];
    if (Statistics != undefined && ListByCountryTypeService1 != undefined) {// 检查是否获取成功
        const pubDate = (new Date((function (s) {
            if (s.modifyime == undefined) {// 处理打字错误
                if (s.modifyTime == undefined) {
                    return 0;
                } else {
                    return s.modifyTime;
                }
            } else {
                s.modifyTime = s.modifyime;
                return s.modifyime;
            }

        })(Statistics)));
        if (oldData == undefined) {
            oldData = {
                Statistics: Statistics,
                ListByCountryTypeService1: ListByCountryTypeService1
            };
        }

        function addUpdatedSign(dataStr) {
            if (Statistics[dataStr] == oldData.Statistics[dataStr]) {
                return Statistics[dataStr];
            } else {
                return (Statistics[dataStr] + "   [有更新!]");
            }
        }

        function countAnalyze(raw) {
            // 全国 确诊 544 例 疑似 137 例 治愈 28 例 死亡 17 例
            // 全国：确诊 ([0-9]+) 例 疑似 ([0-9]+) 例 治愈 ([0-9]+) 例 死亡 ([0-9]+) 例
            const a = /确诊 ([0-9]+) 例 疑似 ([0-9]+) 例 治愈 ([0-9]+) 例 死亡 ([0-9]+) 例/g.exec(raw);
            return a ? {
                确诊: a[1],
                疑似: a[2],
                治愈: a[3],
                死亡: a[4],
            } : -1;
        }
        Statistics._count = countAnalyze(Statistics.countRemark);

        items.push({
            title: `新型冠状病毒简报-${pubDate.toUTCString()}`, // 文章标题
            description: `<pre>
            距离上次更新:${(function(oldTime, newTime) {
                    const ta = ((newTime - oldTime) / 60000).toString().slice('.');
                      return `${ta[0]}分钟${ta[1] ? (ta[1] * 60) + "秒" : ''}`;
                })(new Date(oldData.Statistics.modifyTime), pubDate)}
                <br>传染源:${addUpdatedSign("infectSource")}  病原体:${addUpdatedSign("virus")}
                <br>传播途径:${addUpdatedSign("passWay")}
                <br>${addUpdatedSign("summary")}
                <br>${Statistics.countRemark}
                <br>${(function (oldData, newDataC, countAnalyze) {
                    if (newDataC == -1) {
                        return "(!数据格式有更新!)";
                    }
                    if (oldData._count == undefined) {
                        oldData._count = countAnalyze(oldData.Statistics.countRemark);
                    }
                    const oldDataC = oldData._count, str = "较上次更新:";
                    for (const i in newDataC) {
                        const t = newDataC[i] - oldDataC[i];
                        if (t != 0) {str += `${i}:${t}`;}
                    }
                    return str;
                })(oldData, Statistics._count, countAnalyze)}
                ${(function(Statistics, addUpdatedSign) {// 兼容未来可能添加的注记
                    let i = 1, str = "";
                    while (!((Statistics[`remark${i}`] == undefined) || (Statistics[`remark${i}`] == ""))) {
                        str += "<br>" + addUpdatedSign(`remark${i}`);
                        i++;
                    }
                    return str;
                })(Statistics, addUpdatedSign, oldData)}
                ${(function(dataProvince, oldDataProvince) {
                    // 处理传入参数
        let subscribedProvinces = ctx.params.province;
                    if (subscribedProvinces) {
                        let str = "";
                        const now = {}, old = {};
                        subscribedProvinces = subscribedProvinces.split('|');
                        function convertFromTags(tags) {
                                let content = tags.split(/,|，/);
                                const dataProccessed = {unknown:""};
                                 if (!(content.length > 1)) {// 兼容空格分隔
                                    content = tags.split(' ');
                                    // sample:确诊 3 例 疑似 115 例
                                    const strArray = [], unknown = content;
                                    const TO_DELETE = "_TO_DELETE_";
                                    for (const charNo in content) {
                                        if ((content[charNo] == "例") && (/[0-9]+/.exec(content[charNo - 1]))) {
                                                strArray.push(`${content[charNo - 2]} ${content[charNo - 1]} ${content[charNo]}`);
                                                for (let i = charNo - 2;i <= charNo;i++) {
                                                    unknown[i] = TO_DELETE;
                                                }
                                        }
                                    }
                                    const deletedUnknown = [];
                                    for (const i in unknown) {
                                        if (unknown[i] != TO_DELETE) {
                                            deletedUnknown.push(unknown[i]);
                                        }
                                    }
                                    if (deletedUnknown.length > 0) {(strArray.push(deletedUnknown.join(' ')));}
                                    content = strArray;
                                 }


                                for (const i in content) {
                                    const regExResult = /([\S]+) ([0-9]+)/.exec(content[i]);// OO {num} 型
                                    if (regExResult) {
                                        dataProccessed[regExResult[1]] = regExResult[2];
                                    } else {
                                        dataProccessed.unknown += content[i];
                                    }
                                }
                                return dataProccessed;
                               }
                        for (const item in subscribedProvinces) {

                            for (const id in dataProvince) {
                                if (subscribedProvinces[item] == dataProvince[id].provinceShortName) {
                                   // sample:确诊 444 例，疑似病例数待确认，治愈 28 例，死亡 17 例

                                   now[subscribedProvinces[item]] = convertFromTags(dataProvince[id].tags);
                                   old[subscribedProvinces[item]] = convertFromTags(oldDataProvince[id].tags);
                                   break;
                                }
                            }
                            // 检查now[subscribedProvinces[item]]是否为空
                            if (now[subscribedProvinces[item]]) {
                              const nowDataProccessed = now[subscribedProvinces[item]], oldDataProccessed = old[subscribedProvinces[item]], differ = {}, strArray = [];
                               for (const dataName in nowDataProccessed) {
                                 if (dataName != "unknown") {
                                    differ[dataName] = nowDataProccessed[dataName] - oldDataProccessed[dataName];
                                    strArray.push(`${dataName}:${nowDataProccessed[dataName]}${differ[dataName] == 0 ? `(${differ[dataName]})` : ""} 例`);
                                 }
                            }
                              if (nowDataProccessed.unknown) {strArray.push(nowDataProccessed.unknown);}
                              str += `<br>${subscribedProvinces[item]}: ${strArray.join("，")}`;
                            } else {
                              str += `<br>${subscribedProvinces[item]}：无数据或键入错误。`;
                            }

                        }
                        return str;
                    } else {
                        return "";
                    }
                })(ListByCountryTypeService1, oldData.ListByCountryTypeService1)}
                </pre><br><p>疫情地图:</p>
                <img src=${Statistics.imgUrl} referrerpolicy="no-referrer">`,
            pubDate: pubDate.toUTCString(),
            guid: `brief${pubDate.getTime()}`,
            link: srcLink,
        },);

    } else {
        items.push({
            title: '错误:解析失败',
            author: '',
            category: '',
            description: "script#getStatisticsService:" + $('script#getStatisticsService').html() + "  script#getListByCountryTypeService1:" + $('script#getListByCountryTypeService1').html(),
            pubDate: Date.now().toString(),
            guid: 'err' + Date.now().toString(),
            link: srcLink,
        });
    };
    ctx.state.data = {
        title: '新型冠状病毒疫情概况(数据源:丁香医生)',
        link: srcLink,
        item: items,
    };
    fs.writeFile(dataPath, JSON.stringify({
        Statistics: Statistics,
        ListByCountryTypeService1: ListByCountryTypeService1
    }), function (err) {
        if (err) {
            console.error(err);
        };
    });
    console.timeEnd('run time')
};
