import type { Context } from 'hono';

import type { Route } from '@/types';

import { buildFeed, rootUrl } from './utils';

export const route: Route = {
    path: '/area/:id',
    categories: ['traditional-media'],
    example: '/asahi/area/hokkaido',
    parameters: { id: '地方 id，见下表' },
    description: `北海道・東北

| 北海道   | 青森   | 秋田  | 岩手  | 山形     | 宮城   | 福島      |
| -------- | ------ | ----- | ----- | -------- | ------ | --------- |
| hokkaido | aomori | akita | iwate | yamagata | miyagi | fukushima |

関東

| 群馬  | 茨城    | 栃木    | 埼玉    | 千葉  | 東京  | 神奈川   |
| ----- | ------- | ------- | ------- | ----- | ----- | -------- |
| gunma | ibaraki | tochigi | saitama | chiba | tokyo | kanagawa |

東海・甲信越

| 静岡     | 岐阜 | 愛知  | 三重 | 新潟    | 山梨      | 長野   |
| -------- | ---- | ----- | ---- | ------- | --------- | ------ |
| shizuoka | gifu | aichi | mie  | niigata | yamanashi | nagano |

近畿・北陸

| 滋賀  | 京都  | 奈良 | 和歌山   | 大阪  | 兵庫  | 富山   | 石川     | 福井  |
| ----- | ----- | ---- | -------- | ----- | ----- | ------ | -------- | ----- |
| shiga | kyoto | nara | wakayama | osaka | hyogo | toyama | ishikawa | fukui |

中国・四国

| 鳥取    | 島根    | 岡山    | 広島      | 山口      | 香川   | 愛媛  | 徳島      | 高知  |
| ------- | ------- | ------- | --------- | --------- | ------ | ----- | --------- | ----- |
| tottori | shimane | okayama | hiroshima | yamaguchi | kagawa | ehime | tokushima | kochi |

九州・沖縄

| 福岡    | 大分 | 宮崎     | 鹿児島    | 佐賀 | 長崎     | 熊本     | 沖縄    |
| ------- | ---- | -------- | --------- | ---- | -------- | -------- | ------- |
| fukuoka | oita | miyazaki | kagoshima | saga | nagasaki | kumamoto | okinawa |`,
    name: '朝日新聞デジタル地域',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    return await buildFeed(ctx, `${rootUrl}/area/${id}/list.html`);
}
