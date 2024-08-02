import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import dayjs from 'dayjs';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import { config } from './config';
import { radar } from './radar';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/:type/:id?',
    categories: ['university'],
    example: '/shiep/news/notice',
    parameters: { type: '类型名称，见下表', id: '页面 ID，默认为通知公告或学院公告所对应的 ID' },
    radar,
    name: '新闻网与学院通知',
    maintainers: ['gumibea', 'TeamSUEP'],
    handler,
    description: `类型名称与默认 ID：

  学院一览：

  | 能源与机械工程学院 | 环境与化学工程学院 | 电气工程学院 | 自动化工程学院 | 计算机科学与技术学院 | 电子与信息工程学院 | 经济与管理学院 | 数理学院 | 外国语学院 | 体育学院 | 马克思主义学院 | 人文艺术学院 | 继续教育学院（国际教育学院） | 海上风电研究院 |
  | ------------------ | ------------------ | ------------ | -------------- | -------------------- | ------------------ | -------------- | -------- | ---------- | -------- | -------------- | ------------ | ---------------------------- | -------------- |
  | energy             | hhxy               | dqxy         | zdhxy          | jsjxy                | dxxy               | jgxy           | slxy     | wgyxy      | tyb      | skb            | rwysxy       | jjxy                         | hsfdyjy        |
  | 892                | 5559               | 2462         | 2002           | xygg                 | tzgg               | 3633           | 2063     | tzgg       | 2891     | 1736           | 3089         | 2582                         | 5748           |

  党群部门：

  | 党委办公室 | 组织部（老干部处、党校） | 党建服务中心 / 党建督查室 | 宣传部（文明办、融媒体中心） | 统战部 | 机关党委 | 纪委（监察专员办公室） | 巡查办    | 武装部 | 学生工作部 | 团委 | 工会（妇工委） | 教师工作部 | 离退休党委 | 研究生工作部 |
  | ---------- | ------------------------ | ------------------------- | ---------------------------- | ------ | -------- | ---------------------- | --------- | ------ | ---------- | ---- | -------------- | ---------- | ---------- | ------------ |
  | dangban    | zzb                      | djfwzxdcs                 | xcb                          | tzb    | jgdw     | jijian                 | xunchaban | bwc    | xsc        | tw   | gonghui        | rsc        | tgb        | yjsc         |
  | 4013       | 1534                     | tzgg                      | 2925                         | 3858   | 3205     | 59                     | 5044      | tzgg   | 3482       | 2092 | 1806           | 1695       | notice     | 1161         |

  行政部门：

  | 校长办公室（档案馆） | 对外联络处 | 发展规划处 | 审计处 | 保卫处 | 学生处 | 人事处 | 退管办 | 国际交流与合作处（港澳台办公室） | 科研处 / 融合办 | 教务处 | 研究生院 | 后勤管理处（后勤服务中心） | 实验室与资产管理处 | 基建处 | 临港新校区建设综合办公室 | 图书馆  | 现代教育技术中心 / 信息办 | 创新创业工程训练中心 | 资产经营公司 / 产业办 | 能源电力科创中心 | 技术转移中心 |
  | -------------------- | ---------- | ---------- | ------ | ------ | ------ | ------ | ------ | -------------------------------- | --------------- | ------ | -------- | -------------------------- | ------------------ | ------ | ------------------------ | ------- | ------------------------- | -------------------- | --------------------- | ---------------- | ------------ |
  | office               | dwllc      | fzghc      | sjc    | bwc    | xsc    | rsc    | tgb    | fao                              | kyc             | jwc    | yjsc     | hqglc                      | sysyzcglc          | jjc    | lgxq                     | library | metc                      | ieetc                | cyb                   | kczx             | jszyzx       |
  | 389                  | 2649       | 291        | 199    | tzgg   | 3482   | 1695   | notice | tzgg                             | 834             | 227    | 1161     | 1616                       | 312                | 327    | 377                      | 4866    | tzgg                      | cxcy                 | 367                   | 3946             | 4247         |

  其它：

  | 新闻网 | 信息公开网 | 本科招生网 | 本科就业信息网 | 文明办  | 学习路上 | “学条例 守党纪”专题网 | 上海新能源人才技术教育交流中心 | 上海绿色能源并网技术研究中心 | 能源电力智库 | 智能发电实验教学中心 |
  | ------ | ---------- | ---------- | -------------- | ------- | -------- | --------------------- | ------------------------------ | ---------------------------- | ------------ | -------------------- |
  | news   | xxgk       | zs         | career         | wenming | ztjy     | xxjy                  | gec                            | green-energy                 | nydlzk       | spgc                 |
  | notice | zxgkxx     | zxxx       | tzgg           | 2202    | 5575     | 5973                  | 1959                           | 118                          | tzgg         | 4449                 |

  参数与来源页面对应规则为：\`https://\${type}.shiep.edu.cn/\${id}/list.htm\``,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    if (!Object.keys(config).includes(type)) {
        throw new InvalidParameterError(`Invalid type: ${type}`);
    }

    const { listSelector = '.list_item', pubDateSelector = '.Article_PublishDate', descriptionSelector = '.wp_articlecontent', title } = config[type];

    if (!title) {
        throw new InvalidParameterError(`Invalid type: ${type}`);
    }

    const host = `https://${type}.shiep.edu.cn`;
    const id = ctx.req.param('id') || config[type].id;
    const link = type === 'career' ? `${host}/news/index/tag/${id}` : `${host}/${id}/list.htm`;

    const response = await got(link);
    const $ = load(response.data);

    const list = $(listSelector)
        .toArray()
        .map((item) => {
            item = $(item);
            const pubDateText = item.find(pubDateSelector).text().trim();
            const match = pubDateText.match(/\b(\d{4}-\d{2}-\d{2})\b/);
            return {
                title: item.find('a').attr('title') || item.find('h3').text() || item.find('a').text(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: match ? parseDate(match[0], 'YYYY-MM-DD') : null,
            };
        })
        .filter((item) => {
            const date = dayjs(item.pubDate);
            return date.isValid();
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);

                    item.description =
                        $(descriptionSelector).length > 0
                            ? art(path.resolve(__dirname, 'templates/description.art'), {
                                  description: $(descriptionSelector).html(),
                              })
                            : '请进行统一身份认证后查看内容';
                } catch {
                    item.description = '请在校内或通过校园VPN查看内容';
                }
                return item;
            })
        )
    );

    return {
        title: `上海电力大学-${title}`,
        link,
        item: items,
    };
}
