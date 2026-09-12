import type { Context } from 'hono';

import type { Route } from '@/types';

import { buildFeed, rootUrl } from './utils';

export const route: Route = {
    path: '/:genre?/:category?',
    categories: ['traditional-media'],
    example: '/asahi',
    parameters: { genre: '类型，见下表，默认为トップ', category: '分类，见下表，默认为空，即该类型下所有新闻' },
    description: `::: tip

以下小标题即类型 \`genre\`，标题下表格中为对应类型的分类 \`category\`，两者需要配合使用。

如订阅 **社会** 类型中的 **事件・事故・裁判** 分类，填入 [\`/asahi/national/incident\`](https://rsshub.app/asahi/national/incident)。

若类型下没有分类，如 **トップ** 类型，直接填入 [\`/asahi/top\`](https://rsshub.app/asahi/top)。

或者欲订阅该类型下的所有分类，如订阅 **社会** 中的所有分类，则直接将分类 \`category\` 留空，即 [\`/asahi/national\`](https://rsshub.app/asahi/national)。

:::

トップ top

社会 national

| 事件・事故・裁判 | 災害・交通情報 | その他・話題 | おくやみ   |
| ---------------- | -------------- | ------------ | ---------- |
| incident         | calamity       | etc          | obituaries |

経済 business

| 産業・商品 | 金融・財政 | 経済政策       | 労働・雇用 | 市況・統計 |
| ---------- | ---------- | -------------- | ---------- | ---------- |
| industry   | finance    | economicpolicy | work       | statistics |

政治 politics

| 国政       | 地方政治 | 発言録       | 世論調査 |
| ---------- | -------- | ------------ | -------- |
| government | local    | hatsugenroku | yoron    |

国際 international

| アジア・太平洋 | 北米     | 中南米   | ヨーロッパ | 中東       | アフリカ | 国連・その他 |
| -------------- | -------- | -------- | ---------- | ---------- | -------- | ------------ |
| asia           | namerica | samerica | europe     | middleeast | africa   | etc          |

スポーツ sports

| 野球     | サッカー | 相撲 | フィギュア          | ゴルフ | 一般スポーツ | 東京オリンピック 2020 | 東京パラリンピック 2020 |
| -------- | -------- | ---- | ------------------- | ------ | ------------ | --------------------- | ----------------------- |
| baseball | soccer   | sumo | winter\\_figureskate | golf   | general      | olympics              | paralympics             |

IT・科学 tech\\_science

| 環境・エネルギー | 科学    | デジもの | 企業・サービス | 製品ファイル |
| ---------------- | ------- | -------- | -------------- | ------------ |
| eco              | science | digital  | service        | products     |

文化・芸能 culture

| 映画   | 音楽  | アイドル | アート | テレビ・芸能 | 舞台・演芸 | マンガ・アニメ・ゲーム | ひと・歴史 | 囲碁 | 将棋   |
| ------ | ----- | -------- | ------ | ------------ | ---------- | ---------------------- | ---------- | ---- | ------ |
| movies | music | idol     | art    | showbiz      | stage      | manga                  | history    | igo  | shougi |

ライフ life

| 介護      | 働き方・就活 | 食・料理 |
| --------- | ------------ | -------- |
| eldercare | hataraku     | food     |

教育・子育て edu

| 小中高  | 大学       | 教育制度・話題 | 教育問題 | 地域の教育ニュース | 吹奏楽    | 合唱   | 子育て   | ハグスタ |
| ------- | ---------- | -------------- | -------- | ------------------ | --------- | ------ | -------- | -------- |
| student | university | system         | issue    | chiiki             | suisogaku | gassho | hagukumu | msta     |`,
    name: '新聞',
    maintainers: ['nczitzk'],
    handler,
};

const categories = new Map([
    ['obituaries', '/obituaries'],
    ['yoron', '/politics/yoron'],
    ['baseball', '/sports/baseball'],
    ['soccer', '/sports/soccer'],
    ['sumo', '/sports/sumo'],
    ['winter_figureskate', '/sports/winter/figureskate'],
    ['golf', '/sports/golf'],
    ['general', '/sports/general'],
    ['olympics', '/olympics'],
    ['paralympics', '/paralympics'],
    ['eco', '/eco'],
    ['igo', '/igo'],
    ['shougi', '/shougi'],
    ['eldercare', '/national/eldercare'],
    ['hataraku', '/special/hataraku'],
    ['food', '/culture/food'],
    ['gassho', '/edu/gassho'],
    ['suisogaku', '/edu/suisogaku'],
    ['hagukumu', '/edu/hagukumu'],
    ['msta', '/msta'],
]);

async function handler(ctx: Context) {
    const { genre = '', category = '' } = ctx.req.param();

    let currentUrl;
    if (genre) {
        if (category) {
            const categoryPath = categories.get(category);
            currentUrl = categoryPath ? `${rootUrl}${categoryPath}` : `${rootUrl}/${genre}/list/${category}.html`;
        } else {
            currentUrl = `${rootUrl}/${genre}`;
        }
    } else {
        currentUrl = `${rootUrl}/news/history.html`;
    }

    return await buildFeed(ctx, currentUrl);
}
