import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const isChinese = (text: string): boolean => /^[\u4E00-\u9FA5]+$/.test(text);

export const handler = async (ctx) => {
    const DEFAULT_CATEGORY = '最新推荐';
    const DEFAULT_CLASSID = 0;
    const DEFAULT_ORDERBY = 'hot';

    const { category = DEFAULT_CATEGORY } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    // If `category` is in Chinese, it should come from the tab titles,
    // because each `recipe-type` has an English ID.
    // e.g. `recai` is for [热菜](https://home.meishichina.com/recipe/recai/). `mifan` is for [米饭](https://home.meishichina.com/recipe/mifan/).

    const isTab = isChinese(category);

    // Some categories, for example, [做法简单的菜谱](https://home.meishichina.com/recipe-type-do-level-view-1.html).
    // The URLs of theirs start with `recipe` and end with `.html`.

    const isHtml = category.startsWith('recipe');

    const rootUrl = 'https://home.meishichina.com';
    const rootImageUrl = 'https://i3.meishichina.com';
    const currentUrl = new URL(`${isHtml ? '' : 'recipe'}${isTab ? '.html' : `/${category.endsWith('/') ? category : `${category}${isHtml ? '.html' : '/'}`}`}`, rootUrl).href;
    const apiUrl = new URL('ajax/ajax.php', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const categoryEl = isTab
        ? $('div#recipeindex_info_wrap a')
              .toArray()
              .find((a) => $(a).text() === category)
        : undefined;

    const { data: response } = isTab
        ? await got(apiUrl, {
              searchParams: {
                  ac: 'recipe',
                  op: 'getMoreDiffStateRecipeList',
                  classid: categoryEl ? $(categoryEl).prop('data') : DEFAULT_CLASSID,
                  orderby: categoryEl ? $(categoryEl).prop('order') : DEFAULT_ORDERBY,
                  page: 1,
              },
          })
        : { data: undefined };

    let items = isTab
        ? response.data.slice(0, limit).map((item) => {
              const title = item.title;
              const guid = `meishichina-${item.id}`;
              const image = item.fcover.split(/\?/)[0];

              return {
                  title,
                  pubDate: item.datelines ? parseDate(item.datelines, 'X') : parseDate(item.dateline, 'YYYY-M-D'),
                  link: new URL(`recipe-${item.id}.html`, rootUrl).href,
                  category: item.mainingredient.replace(/。$/, '').split('、'),
                  author: item.username,
                  guid,
                  id: guid,
                  image,
                  banner: image,
              };
          })
        : $('div#J_list ul li')
              .slice(0, limit)
              .toArray()
              .map((item) => {
                  item = $(item);

                  const title = item.find('div.detail h2').text();
                  const description = item.find('div.detail').html();
                  const guid = `meishichina-${item.prop('data-id')}`;
                  const image = item.find('div.pic img').prop('src').split(/\?/)[0];

                  return {
                      title,
                      description,
                      link: item.find('div.detail h2 a').prop('href'),
                      category: item.find('p.subcontent').text().replace(/。$/, '').split('、'),
                      author: item.find('p.subline a').text(),
                      guid,
                      id: guid,
                      content: {
                          html: description,
                          text: item.find('div.detail').text(),
                      },
                      image,
                      banner: image,
                  };
              });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                $$('input[type="hidden"]').remove();
                $$('p.J_photo, p.copyright').remove();
                $$('div.sharebox').nextAll().addBack().remove();

                const title = $$('a#recipe_title').text();
                const description = $$('div.recipDetail').html();
                const image = $$('div#recipe_De_imgBox img').prop('src')?.split(/\?/)[0] ?? undefined;

                const pubDate = detailResponse.match(/"pubDate":\s"(.*?)",/)?.[1] ?? undefined;
                const updated = detailResponse.match(/"upDate":\s"(.*?)",/)?.[1] ?? undefined;

                item.title = title;
                item.description = description;
                item.pubDate = pubDate ? parseDate(pubDate) : item.pubDate;
                item.category = [
                    ...new Set([
                        ...$$('div.recipeTip a')
                            .toArray()
                            .map((c) => $$(c).prop('title')),
                        ...$$('fieldset.particulars span.category_s1')
                            .toArray()
                            .map((c) => $$(c).text().trim()),
                    ]),
                ].filter(Boolean);
                item.author = $$('span#recipe_username').text();
                item.content = {
                    html: description,
                    text: $$('div.recipDetail').text(),
                };
                item.image = image;
                item.banner = image;
                item.updated = updated ? parseDate(updated) : item.updated;

                return item;
            })
        )
    );

    const image = new URL('static/lib/logo.png', rootImageUrl).href;

    return {
        title: `${isTab ? (categoryEl ? category : DEFAULT_CATEGORY) : `${$('h1.on').text()}${$('a.right.on').text()}`}${(
            $('title')
                .text()
                .match(/(?:.*_)?([^_]+)_(.*)$/) || []
        )
            .slice(1, 3)
            .join('_')}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('div.logo_inner a').prop('title'),
    };
};

export const route: Route = {
    path: '/recipe/:category{.+}?',
    name: '菜谱',
    url: 'home.meishichina.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/meishichina/recipe',
    parameters: { category: '分类，默认为最新推荐，见下表' },
    description: `::: tip
  若订阅 [菜谱大全](https://home.meishichina.com/recipe.html) 中的 \`最新推荐\` 分类，将 \`最新推荐\` 作为参数填入，此时路由为 [\`/meishichina/recipe/最新推荐/\`](https://rsshub.app/meishichina/recipe/最新推荐)。

  若订阅 [菜谱大全](https://home.meishichina.com/recipe.html) 中的 \`自制食材\` 分类，将 \`自制食材\` 作为参数填入，此时路由为 [\`/meishichina/recipe/自制食材/\`](https://rsshub.app/meishichina/recipe/自制食材)。
:::

| [最新推荐](https://home.meishichina.com/recipe.html) | [最新发布](https://home.meishichina.com/recipe.html) | [热菜](https://home.meishichina.com/recipe.html) | [凉菜](https://home.meishichina.com/recipe.html) | [汤羹](https://home.meishichina.com/recipe.html) | [主食](https://home.meishichina.com/recipe.html) | [小吃](https://home.meishichina.com/recipe.html) | [西餐](https://home.meishichina.com/recipe.html) | [烘焙](https://home.meishichina.com/recipe.html) | [自制食材](https://home.meishichina.com/recipe.html) |
| ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------- |

::: tip
  若订阅 [全部分类](https://home.meishichina.com/recipe-type.html) 中的对应分类页，见下方说明。

  若订阅 [热菜最新菜谱](https://home.meishichina.com/recipe/recai/)，网址为 \`https://home.meishichina.com/recipe/recai/\`。截取 \`https://home.meishichina.com/recipe/\` 到末尾 \`/\` 的部分 \`recai\` 作为参数填入，此时路由为 [\`/meishichina/recipe/recai/\`](https://rsshub.app/meishichina/recipe/recai)。
  
  若订阅 [米饭最热菜谱](https://home.meishichina.com/recipe/mifan/hot/)，网址为 \`https://home.meishichina.com/recipe/mifan/hot/\`。截取 \`https://home.meishichina.com/recipe/\` 到末尾 \`/\` 的部分 \`mifan/hot\` 作为参数填入，此时路由为 [\`/meishichina/recipe/mifan/hot/\`](https://rsshub.app/meishichina/recipe/mifan/hot)。
  
  若订阅 [制作难度简单菜谱](https://home.meishichina.com/recipe-type-do-level-view-1.html)，网址为 \`https://home.meishichina.com/recipe-type-do-level-view-1.html\`。截取 \`https://home.meishichina.com/\` 到末尾 \`.html\` 的部分 \`recipe-type-do-level-view-1\` 作为参数填入，此时路由为 [\`/meishichina/recipe/recipe-type-do-level-view-1/\`](https://rsshub.app/meishichina/recipe/recipe-type-do-level-view-1)。
:::

<details>
<summary>更多分类</summary>

#### 常见菜式

| [热菜](https://home.meishichina.com/recipe/recai/)   | [凉菜](https://home.meishichina.com/recipe/liangcai/)      | [汤羹](https://home.meishichina.com/recipe/tanggeng/)      | [主食](https://home.meishichina.com/recipe/zhushi/)    | [小吃](https://home.meishichina.com/recipe/xiaochi/)     | [家常菜](https://home.meishichina.com/recipe/jiachang/)    |
| ---------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------- |
| [recai](https://rsshub.app/meishichina/recipe/recai) | [liangcai](https://rsshub.app/meishichina/recipe/liangcai) | [tanggeng](https://rsshub.app/meishichina/recipe/tanggeng) | [zhushi](https://rsshub.app/meishichina/recipe/zhushi) | [xiaochi](https://rsshub.app/meishichina/recipe/xiaochi) | [jiachang](https://rsshub.app/meishichina/recipe/jiachang) |

| [泡酱腌菜](https://home.meishichina.com/recipe/jiangpaoyancai/)        | [西餐](https://home.meishichina.com/recipe/xican/)   | [烘焙](https://home.meishichina.com/recipe/hongbei/)     | [烤箱菜](https://home.meishichina.com/recipe/kaoxiangcai/)       | [饮品](https://home.meishichina.com/recipe/yinpin/)    | [零食](https://home.meishichina.com/recipe/lingshi/)     |
| ---------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| [jiangpaoyancai](https://rsshub.app/meishichina/recipe/jiangpaoyancai) | [xican](https://rsshub.app/meishichina/recipe/xican) | [hongbei](https://rsshub.app/meishichina/recipe/hongbei) | [kaoxiangcai](https://rsshub.app/meishichina/recipe/kaoxiangcai) | [yinpin](https://rsshub.app/meishichina/recipe/yinpin) | [lingshi](https://rsshub.app/meishichina/recipe/lingshi) |

| [火锅](https://home.meishichina.com/recipe/huoguo/)    | [自制食材](https://home.meishichina.com/recipe/zizhishicai/)     | [海鲜](https://home.meishichina.com/recipe/haixian/)     | [宴客菜](https://home.meishichina.com/recipe/yankecai/)    |
| ------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| [huoguo](https://rsshub.app/meishichina/recipe/huoguo) | [zizhishicai](https://rsshub.app/meishichina/recipe/zizhishicai) | [haixian](https://rsshub.app/meishichina/recipe/haixian) | [yankecai](https://rsshub.app/meishichina/recipe/yankecai) |

#### 主食/小吃

| [米饭](https://home.meishichina.com/recipe/mifan/)   | [炒饭](https://home.meishichina.com/recipe/chaofan/)     | [面食](https://home.meishichina.com/recipe/mianshi/)     | [包子](https://home.meishichina.com/recipe/baozi/)   | [饺子](https://home.meishichina.com/recipe/jiaozi/)    | [馒头花卷](https://home.meishichina.com/recipe/mantou/) |
| ---------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| [mifan](https://rsshub.app/meishichina/recipe/mifan) | [chaofan](https://rsshub.app/meishichina/recipe/chaofan) | [mianshi](https://rsshub.app/meishichina/recipe/mianshi) | [baozi](https://rsshub.app/meishichina/recipe/baozi) | [jiaozi](https://rsshub.app/meishichina/recipe/jiaozi) | [mantou](https://rsshub.app/meishichina/recipe/mantou)  |

| [面条](https://home.meishichina.com/recipe/miantiao/)      | [饼](https://home.meishichina.com/recipe/bing/)    | [粥](https://home.meishichina.com/recipe/zhou/)    | [馄饨](https://home.meishichina.com/recipe/hundun/)    | [五谷杂粮](https://home.meishichina.com/recipe/wuguzaliang/)     | [北京小吃](https://home.meishichina.com/recipe/beijingxiaochi/)        |
| ---------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [miantiao](https://rsshub.app/meishichina/recipe/miantiao) | [bing](https://rsshub.app/meishichina/recipe/bing) | [zhou](https://rsshub.app/meishichina/recipe/zhou) | [hundun](https://rsshub.app/meishichina/recipe/hundun) | [wuguzaliang](https://rsshub.app/meishichina/recipe/wuguzaliang) | [beijingxiaochi](https://rsshub.app/meishichina/recipe/beijingxiaochi) |

| [陕西小吃](https://home.meishichina.com/recipe/shanxixiaochi/)       | [广东小吃](https://home.meishichina.com/recipe/guangdongxiaochi/)          | [四川小吃](https://home.meishichina.com/recipe/sichuanxiaochi/)        | [重庆小吃](https://home.meishichina.com/recipe/chongqingxiaochi/)          | [天津小吃](https://home.meishichina.com/recipe/tianjinxiaochi/)        | [上海小吃](https://home.meishichina.com/recipe/shanghaixiochi/)        |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [shanxixiaochi](https://rsshub.app/meishichina/recipe/shanxixiaochi) | [guangdongxiaochi](https://rsshub.app/meishichina/recipe/guangdongxiaochi) | [sichuanxiaochi](https://rsshub.app/meishichina/recipe/sichuanxiaochi) | [chongqingxiaochi](https://rsshub.app/meishichina/recipe/chongqingxiaochi) | [tianjinxiaochi](https://rsshub.app/meishichina/recipe/tianjinxiaochi) | [shanghaixiochi](https://rsshub.app/meishichina/recipe/shanghaixiochi) |

| [福建小吃](https://home.meishichina.com/recipe/fujianxiaochi/)       | [湖南小吃](https://home.meishichina.com/recipe/hunanxiaochi/)      | [湖北小吃](https://home.meishichina.com/recipe/hubeixiaochi/)      | [江西小吃](https://home.meishichina.com/recipe/jiangxixiaochi/)        | [山东小吃](https://home.meishichina.com/recipe/shandongxiaochi/)         | [山西小吃](https://home.meishichina.com/recipe/jinxiaochi/)    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| [fujianxiaochi](https://rsshub.app/meishichina/recipe/fujianxiaochi) | [hunanxiaochi](https://rsshub.app/meishichina/recipe/hunanxiaochi) | [hubeixiaochi](https://rsshub.app/meishichina/recipe/hubeixiaochi) | [jiangxixiaochi](https://rsshub.app/meishichina/recipe/jiangxixiaochi) | [shandongxiaochi](https://rsshub.app/meishichina/recipe/shandongxiaochi) | [jinxiaochi](https://rsshub.app/meishichina/recipe/jinxiaochi) |

| [河南小吃](https://home.meishichina.com/recipe/henanxiaochi/)      | [台湾小吃](https://home.meishichina.com/recipe/taiwanxiaochi/)       | [江浙小吃](https://home.meishichina.com/recipe/jiangzhexiaochi/)         | [云贵小吃](https://home.meishichina.com/recipe/yunguixiaochi/)       | [东北小吃](https://home.meishichina.com/recipe/dongbeixiaochi/)        | [西北小吃](https://home.meishichina.com/recipe/xibeixiaochi/)      |
| ------------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [henanxiaochi](https://rsshub.app/meishichina/recipe/henanxiaochi) | [taiwanxiaochi](https://rsshub.app/meishichina/recipe/taiwanxiaochi) | [jiangzhexiaochi](https://rsshub.app/meishichina/recipe/jiangzhexiaochi) | [yunguixiaochi](https://rsshub.app/meishichina/recipe/yunguixiaochi) | [dongbeixiaochi](https://rsshub.app/meishichina/recipe/dongbeixiaochi) | [xibeixiaochi](https://rsshub.app/meishichina/recipe/xibeixiaochi) |

#### 甜品/饮品

| [甜品](https://home.meishichina.com/recipe/tianpin/)     | [冰品](https://home.meishichina.com/recipe/bingpin/)     | [果汁](https://home.meishichina.com/recipe/guozhi/)    | [糖水](https://home.meishichina.com/recipe/tangshui/)      | [布丁](https://home.meishichina.com/recipe/buding/)    | [果酱](https://home.meishichina.com/recipe/guojiang/)      |
| -------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| [tianpin](https://rsshub.app/meishichina/recipe/tianpin) | [bingpin](https://rsshub.app/meishichina/recipe/bingpin) | [guozhi](https://rsshub.app/meishichina/recipe/guozhi) | [tangshui](https://rsshub.app/meishichina/recipe/tangshui) | [buding](https://rsshub.app/meishichina/recipe/buding) | [guojiang](https://rsshub.app/meishichina/recipe/guojiang) |

| [果冻](https://home.meishichina.com/recipe/guodong/)     | [酸奶](https://home.meishichina.com/recipe/suannai/)     | [鸡尾酒](https://home.meishichina.com/recipe/jiweijiu/)    | [咖啡](https://home.meishichina.com/recipe/kafei/)   | [豆浆](https://home.meishichina.com/recipe/doujiang/)      | [奶昔](https://home.meishichina.com/recipe/naixi/)   |
| -------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| [guodong](https://rsshub.app/meishichina/recipe/guodong) | [suannai](https://rsshub.app/meishichina/recipe/suannai) | [jiweijiu](https://rsshub.app/meishichina/recipe/jiweijiu) | [kafei](https://rsshub.app/meishichina/recipe/kafei) | [doujiang](https://rsshub.app/meishichina/recipe/doujiang) | [naixi](https://rsshub.app/meishichina/recipe/naixi) |

| [冰淇淋](https://home.meishichina.com/recipe/bingqilin/)     |
| ------------------------------------------------------------ |
| [bingqilin](https://rsshub.app/meishichina/recipe/bingqilin) |

#### 适宜人群

| [孕妇](https://home.meishichina.com/recipe/yunfu/)   | [产妇](https://home.meishichina.com/recipe/chanfu/)    | [婴儿](https://home.meishichina.com/recipe/yinger/)    | [儿童](https://home.meishichina.com/recipe/ertong/)    | [老人](https://home.meishichina.com/recipe/laoren/)    | [幼儿](https://home.meishichina.com/recipe/youer/)   |
| ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| [yunfu](https://rsshub.app/meishichina/recipe/yunfu) | [chanfu](https://rsshub.app/meishichina/recipe/chanfu) | [yinger](https://rsshub.app/meishichina/recipe/yinger) | [ertong](https://rsshub.app/meishichina/recipe/ertong) | [laoren](https://rsshub.app/meishichina/recipe/laoren) | [youer](https://rsshub.app/meishichina/recipe/youer) |

| [哺乳期](https://home.meishichina.com/recipe/buruqi/)  | [青少年](https://home.meishichina.com/recipe/qingshaonian/)        |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| [buruqi](https://rsshub.app/meishichina/recipe/buruqi) | [qingshaonian](https://rsshub.app/meishichina/recipe/qingshaonian) |

#### 食疗食补

| [健康食谱](https://home.meishichina.com/recipe/jiankangshipu/)       | [减肥瘦身](https://home.meishichina.com/recipe/shoushen/)  | [贫血](https://home.meishichina.com/recipe/pinxue/)    | [痛经](https://home.meishichina.com/recipe/tongjing/)      | [清热祛火](https://home.meishichina.com/recipe/qingrequhuo/)     | [滋阴](https://home.meishichina.com/recipe/ziyin/)   |
| -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| [jiankangshipu](https://rsshub.app/meishichina/recipe/jiankangshipu) | [shoushen](https://rsshub.app/meishichina/recipe/shoushen) | [pinxue](https://rsshub.app/meishichina/recipe/pinxue) | [tongjing](https://rsshub.app/meishichina/recipe/tongjing) | [qingrequhuo](https://rsshub.app/meishichina/recipe/qingrequhuo) | [ziyin](https://rsshub.app/meishichina/recipe/ziyin) |

| [壮阳](https://home.meishichina.com/recipe/zhuangyang/)        | [便秘](https://home.meishichina.com/recipe/bianmi/)    | [排毒养颜](https://home.meishichina.com/recipe/paiduyangyan/)      | [滋润补水](https://home.meishichina.com/recipe/ziyinbushuui/)      | [健脾养胃](https://home.meishichina.com/recipe/jianbiyangwei/)       | [护肝明目](https://home.meishichina.com/recipe/huganmingmu/)     |
| -------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [zhuangyang](https://rsshub.app/meishichina/recipe/zhuangyang) | [bianmi](https://rsshub.app/meishichina/recipe/bianmi) | [paiduyangyan](https://rsshub.app/meishichina/recipe/paiduyangyan) | [ziyinbushuui](https://rsshub.app/meishichina/recipe/ziyinbushuui) | [jianbiyangwei](https://rsshub.app/meishichina/recipe/jianbiyangwei) | [huganmingmu](https://rsshub.app/meishichina/recipe/huganmingmu) |

| [清肺止咳](https://home.meishichina.com/recipe/qingfeizhike/)      | [下奶](https://home.meishichina.com/recipe/xianai/)    | [补钙](https://home.meishichina.com/recipe/bugai/)   | [醒酒](https://home.meishichina.com/recipe/xingjiu/)     | [抗过敏](https://home.meishichina.com/recipe/kangguomin/)      | [防辐射](https://home.meishichina.com/recipe/fangfushe/)     |
| ------------------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| [qingfeizhike](https://rsshub.app/meishichina/recipe/qingfeizhike) | [xianai](https://rsshub.app/meishichina/recipe/xianai) | [bugai](https://rsshub.app/meishichina/recipe/bugai) | [xingjiu](https://rsshub.app/meishichina/recipe/xingjiu) | [kangguomin](https://rsshub.app/meishichina/recipe/kangguomin) | [fangfushe](https://rsshub.app/meishichina/recipe/fangfushe) |

| [提高免疫力](https://home.meishichina.com/recipe/tigaomianyili/)     | [流感](https://home.meishichina.com/recipe/liugan/)    | [驱寒暖身](https://home.meishichina.com/recipe/quhannuanshen/)       | [秋冬进补](https://home.meishichina.com/recipe/qiudongjinbu/)      | [消暑解渴](https://home.meishichina.com/recipe/xiaoshujieke/)      |
| -------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [tigaomianyili](https://rsshub.app/meishichina/recipe/tigaomianyili) | [liugan](https://rsshub.app/meishichina/recipe/liugan) | [quhannuanshen](https://rsshub.app/meishichina/recipe/quhannuanshen) | [qiudongjinbu](https://rsshub.app/meishichina/recipe/qiudongjinbu) | [xiaoshujieke](https://rsshub.app/meishichina/recipe/xiaoshujieke) |

#### 场景

| [早餐](https://home.meishichina.com/recipe/zaocan/)    | [下午茶](https://home.meishichina.com/recipe/xiawucha/)    | [二人世界](https://home.meishichina.com/recipe/erren/) | [野餐](https://home.meishichina.com/recipe/yecan/)   | [开胃菜](https://home.meishichina.com/recipe/kaiweicai/)     | [私房菜](https://home.meishichina.com/recipe/sifangcai/)     |
| ------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| [zaocan](https://rsshub.app/meishichina/recipe/zaocan) | [xiawucha](https://rsshub.app/meishichina/recipe/xiawucha) | [erren](https://rsshub.app/meishichina/recipe/erren)   | [yecan](https://rsshub.app/meishichina/recipe/yecan) | [kaiweicai](https://rsshub.app/meishichina/recipe/kaiweicai) | [sifangcai](https://rsshub.app/meishichina/recipe/sifangcai) |

| [快餐](https://home.meishichina.com/recipe/kuaican/)     | [快手菜](https://home.meishichina.com/recipe/kuaishoucai/)       | [宿舍时代](https://home.meishichina.com/recipe/susheshidai/)     | [中式宴请](https://home.meishichina.com/recipe/zhongshiyanqing/)         | [西式宴请](https://home.meishichina.com/recipe/xishiyanqing/)      |
| -------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [kuaican](https://rsshub.app/meishichina/recipe/kuaican) | [kuaishoucai](https://rsshub.app/meishichina/recipe/kuaishoucai) | [susheshidai](https://rsshub.app/meishichina/recipe/susheshidai) | [zhongshiyanqing](https://rsshub.app/meishichina/recipe/zhongshiyanqing) | [xishiyanqing](https://rsshub.app/meishichina/recipe/xishiyanqing) |

#### 饮食方式

| [素食](https://home.meishichina.com/recipe/sushi/)   | [素菜](https://home.meishichina.com/recipe/sucai2/)    | [清真菜](https://home.meishichina.com/recipe/qingzhencai/)       | [春季食谱](https://home.meishichina.com/recipe/chunji/) | [夏季食谱](https://home.meishichina.com/recipe/xiaji/) | [秋季食谱](https://home.meishichina.com/recipe/qiuji/) |
| ---------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| [sushi](https://rsshub.app/meishichina/recipe/sushi) | [sucai2](https://rsshub.app/meishichina/recipe/sucai2) | [qingzhencai](https://rsshub.app/meishichina/recipe/qingzhencai) | [chunji](https://rsshub.app/meishichina/recipe/chunji)  | [xiaji](https://rsshub.app/meishichina/recipe/xiaji)   | [qiuji](https://rsshub.app/meishichina/recipe/qiuji)   |

| [冬季食谱](https://home.meishichina.com/recipe/dongji/) | [小清新](https://home.meishichina.com/recipe/xiaoqingxin/)       | [高颜值](https://home.meishichina.com/recipe/gaoyanzhi/)     |
| ------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| [dongji](https://rsshub.app/meishichina/recipe/dongji)  | [xiaoqingxin](https://rsshub.app/meishichina/recipe/xiaoqingxin) | [gaoyanzhi](https://rsshub.app/meishichina/recipe/gaoyanzhi) |

#### 中式菜系

| [川菜](https://home.meishichina.com/recipe/chuancai/)      | [鲁菜](https://home.meishichina.com/recipe/lucai/)   | [闽菜](https://home.meishichina.com/recipe/mincai/)    | [粤菜](https://home.meishichina.com/recipe/yuecai/)    | [苏菜](https://home.meishichina.com/recipe/sucai/)   | [浙菜](https://home.meishichina.com/recipe/zhecai/)    |
| ---------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------ |
| [chuancai](https://rsshub.app/meishichina/recipe/chuancai) | [lucai](https://rsshub.app/meishichina/recipe/lucai) | [mincai](https://rsshub.app/meishichina/recipe/mincai) | [yuecai](https://rsshub.app/meishichina/recipe/yuecai) | [sucai](https://rsshub.app/meishichina/recipe/sucai) | [zhecai](https://rsshub.app/meishichina/recipe/zhecai) |

| [湘菜](https://home.meishichina.com/recipe/xiangcai/)      | [徽菜](https://home.meishichina.com/recipe/huicai/)    | [淮扬菜](https://home.meishichina.com/recipe/huaiyangcai/)       | [豫菜](https://home.meishichina.com/recipe/yucai/)   | [晋菜](https://home.meishichina.com/recipe/jincai/)    | [鄂菜](https://home.meishichina.com/recipe/ecai/)  |
| ---------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| [xiangcai](https://rsshub.app/meishichina/recipe/xiangcai) | [huicai](https://rsshub.app/meishichina/recipe/huicai) | [huaiyangcai](https://rsshub.app/meishichina/recipe/huaiyangcai) | [yucai](https://rsshub.app/meishichina/recipe/yucai) | [jincai](https://rsshub.app/meishichina/recipe/jincai) | [ecai](https://rsshub.app/meishichina/recipe/ecai) |

| [云南菜](https://home.meishichina.com/recipe/yunnancai/)     | [北京菜](https://home.meishichina.com/recipe/beijingcai/)      | [东北菜](https://home.meishichina.com/recipe/dongbeicai/)      | [西北菜](https://home.meishichina.com/recipe/xibeicai/)    | [贵州菜](https://home.meishichina.com/recipe/guizhoucai/)      | [上海菜](https://home.meishichina.com/recipe/shanghaicai/)       |
| ------------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| [yunnancai](https://rsshub.app/meishichina/recipe/yunnancai) | [beijingcai](https://rsshub.app/meishichina/recipe/beijingcai) | [dongbeicai](https://rsshub.app/meishichina/recipe/dongbeicai) | [xibeicai](https://rsshub.app/meishichina/recipe/xibeicai) | [guizhoucai](https://rsshub.app/meishichina/recipe/guizhoucai) | [shanghaicai](https://rsshub.app/meishichina/recipe/shanghaicai) |

| [新疆菜](https://home.meishichina.com/recipe/xinjiangcai/)       | [客家菜](https://home.meishichina.com/recipe/kejiacai/)    | [台湾美食](https://home.meishichina.com/recipe/taiwancai/)   | [香港美食](https://home.meishichina.com/recipe/xianggangcai/)      | [澳门美食](https://home.meishichina.com/recipe/aomeicai/)  | [赣菜](https://home.meishichina.com/recipe/gancai/)    |
| ---------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ |
| [xinjiangcai](https://rsshub.app/meishichina/recipe/xinjiangcai) | [kejiacai](https://rsshub.app/meishichina/recipe/kejiacai) | [taiwancai](https://rsshub.app/meishichina/recipe/taiwancai) | [xianggangcai](https://rsshub.app/meishichina/recipe/xianggangcai) | [aomeicai](https://rsshub.app/meishichina/recipe/aomeicai) | [gancai](https://rsshub.app/meishichina/recipe/gancai) |

| [中式菜系](https://home.meishichina.com/recipe/zhongshicaixi/)       |
| -------------------------------------------------------------------- |
| [zhongshicaixi](https://rsshub.app/meishichina/recipe/zhongshicaixi) |

#### 外国美食

| [日本料理](https://home.meishichina.com/recipe/ribencai/)  | [韩国料理](https://home.meishichina.com/recipe/hanguocai/)   | [泰国菜](https://home.meishichina.com/recipe/taiguocai/)     | [印度菜](https://home.meishichina.com/recipe/yiducai/)   | [法国菜](https://home.meishichina.com/recipe/faguocai/)    | [意大利菜](https://home.meishichina.com/recipe/yidalicai/)   |
| ---------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| [ribencai](https://rsshub.app/meishichina/recipe/ribencai) | [hanguocai](https://rsshub.app/meishichina/recipe/hanguocai) | [taiguocai](https://rsshub.app/meishichina/recipe/taiguocai) | [yiducai](https://rsshub.app/meishichina/recipe/yiducai) | [faguocai](https://rsshub.app/meishichina/recipe/faguocai) | [yidalicai](https://rsshub.app/meishichina/recipe/yidalicai) |

| [西班牙菜](https://home.meishichina.com/recipe/xibanya/) | [英国菜](https://home.meishichina.com/recipe/yingguocai/)      | [越南菜](https://home.meishichina.com/recipe/yuenancai/)     | [墨西哥菜](https://home.meishichina.com/recipe/moxigecai/)   | [外国美食](https://home.meishichina.com/recipe/waiguomeishi/)      |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| [xibanya](https://rsshub.app/meishichina/recipe/xibanya) | [yingguocai](https://rsshub.app/meishichina/recipe/yingguocai) | [yuenancai](https://rsshub.app/meishichina/recipe/yuenancai) | [moxigecai](https://rsshub.app/meishichina/recipe/moxigecai) | [waiguomeishi](https://rsshub.app/meishichina/recipe/waiguomeishi) |

#### 烘焙

| [蛋糕](https://home.meishichina.com/recipe/dangao/)    | [面包](https://home.meishichina.com/recipe/mianbao/)     | [饼干](https://home.meishichina.com/recipe/binggan/)     | [派塔](https://home.meishichina.com/recipe/paita/)   | [吐司](https://home.meishichina.com/recipe/tusi/)  | [戚风蛋糕](https://home.meishichina.com/recipe/qifeng/) |
| ------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| [dangao](https://rsshub.app/meishichina/recipe/dangao) | [mianbao](https://rsshub.app/meishichina/recipe/mianbao) | [binggan](https://rsshub.app/meishichina/recipe/binggan) | [paita](https://rsshub.app/meishichina/recipe/paita) | [tusi](https://rsshub.app/meishichina/recipe/tusi) | [qifeng](https://rsshub.app/meishichina/recipe/qifeng)  |

| [纸杯蛋糕](https://home.meishichina.com/recipe/zhibei/) | [蛋糕卷](https://home.meishichina.com/recipe/dangaojuan/)      | [玛芬蛋糕](https://home.meishichina.com/recipe/mafen/) | [乳酪蛋糕](https://home.meishichina.com/recipe/rulao/) | [芝士蛋糕](https://home.meishichina.com/recipe/zhishi/) | [奶油蛋糕](https://home.meishichina.com/recipe/naiyou/) |
| ------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------- |
| [zhibei](https://rsshub.app/meishichina/recipe/zhibei)  | [dangaojuan](https://rsshub.app/meishichina/recipe/dangaojuan) | [mafen](https://rsshub.app/meishichina/recipe/mafen)   | [rulao](https://rsshub.app/meishichina/recipe/rulao)   | [zhishi](https://rsshub.app/meishichina/recipe/zhishi)  | [naiyou](https://rsshub.app/meishichina/recipe/naiyou)  |

| [批萨](https://home.meishichina.com/recipe/pisa/)  | [慕斯](https://home.meishichina.com/recipe/musi/)  | [曲奇](https://home.meishichina.com/recipe/quqi/)  | [翻糖](https://home.meishichina.com/recipe/fantang/)     |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| [pisa](https://rsshub.app/meishichina/recipe/pisa) | [musi](https://rsshub.app/meishichina/recipe/musi) | [quqi](https://rsshub.app/meishichina/recipe/quqi) | [fantang](https://rsshub.app/meishichina/recipe/fantang) |

#### 传统美食

| [粽子](https://home.meishichina.com/recipe/zongzi/)    | [月饼](https://home.meishichina.com/recipe/yuebing/)     | [春饼](https://home.meishichina.com/recipe/chunbing/)      | [元宵](https://home.meishichina.com/recipe/yuanxiao/)      | [汤圆](https://home.meishichina.com/recipe/tangyuan/)      | [青团](https://home.meishichina.com/recipe/qingtuan/)      |
| ------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| [zongzi](https://rsshub.app/meishichina/recipe/zongzi) | [yuebing](https://rsshub.app/meishichina/recipe/yuebing) | [chunbing](https://rsshub.app/meishichina/recipe/chunbing) | [yuanxiao](https://rsshub.app/meishichina/recipe/yuanxiao) | [tangyuan](https://rsshub.app/meishichina/recipe/tangyuan) | [qingtuan](https://rsshub.app/meishichina/recipe/qingtuan) |

| [腊八粥](https://home.meishichina.com/recipe/labazhou/)    | [春卷](https://home.meishichina.com/recipe/chunjuan/)      | [传统美食](https://home.meishichina.com/recipe/chuantongmeishi/)         |
| ---------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| [labazhou](https://rsshub.app/meishichina/recipe/labazhou) | [chunjuan](https://rsshub.app/meishichina/recipe/chunjuan) | [chuantongmeishi](https://rsshub.app/meishichina/recipe/chuantongmeishi) |

#### 节日食俗

| [立冬](https://home.meishichina.com/recipe/lidong/)    | [冬至](https://home.meishichina.com/recipe/dongzhi/)     | [腊八](https://home.meishichina.com/recipe/laba/)  | [端午节](https://home.meishichina.com/recipe/duanwu/)  | [中秋](https://home.meishichina.com/recipe/zhongqiu/)      | [立春](https://home.meishichina.com/recipe/lichun/)    |
| ------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ |
| [lidong](https://rsshub.app/meishichina/recipe/lidong) | [dongzhi](https://rsshub.app/meishichina/recipe/dongzhi) | [laba](https://rsshub.app/meishichina/recipe/laba) | [duanwu](https://rsshub.app/meishichina/recipe/duanwu) | [zhongqiu](https://rsshub.app/meishichina/recipe/zhongqiu) | [lichun](https://rsshub.app/meishichina/recipe/lichun) |

| [元宵节](https://home.meishichina.com/recipe/yuanxiaojie/)       | [贴秋膘](https://home.meishichina.com/recipe/tieqiubiao/)      | [清明](https://home.meishichina.com/recipe/qingming/)      | [年夜饭](https://home.meishichina.com/recipe/nianyefan/)     | [圣诞节](https://home.meishichina.com/recipe/shengdanjie/)       | [感恩节](https://home.meishichina.com/recipe/ganenjie/)    |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| [yuanxiaojie](https://rsshub.app/meishichina/recipe/yuanxiaojie) | [tieqiubiao](https://rsshub.app/meishichina/recipe/tieqiubiao) | [qingming](https://rsshub.app/meishichina/recipe/qingming) | [nianyefan](https://rsshub.app/meishichina/recipe/nianyefan) | [shengdanjie](https://rsshub.app/meishichina/recipe/shengdanjie) | [ganenjie](https://rsshub.app/meishichina/recipe/ganenjie) |

| [万圣节](https://home.meishichina.com/recipe/wanshengjie/)       | [情人节](https://home.meishichina.com/recipe/qingrenjie/)      | [复活节](https://home.meishichina.com/recipe/fuhuojie/)    | [雨水](https://home.meishichina.com/recipe/yushui/)    | [惊蛰](https://home.meishichina.com/recipe/jingzhi/)     | [春分](https://home.meishichina.com/recipe/chunfen/)     |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| [wanshengjie](https://rsshub.app/meishichina/recipe/wanshengjie) | [qingrenjie](https://rsshub.app/meishichina/recipe/qingrenjie) | [fuhuojie](https://rsshub.app/meishichina/recipe/fuhuojie) | [yushui](https://rsshub.app/meishichina/recipe/yushui) | [jingzhi](https://rsshub.app/meishichina/recipe/jingzhi) | [chunfen](https://rsshub.app/meishichina/recipe/chunfen) |

| [谷雨](https://home.meishichina.com/recipe/guyu/)  | [立夏](https://home.meishichina.com/recipe/lixia/)   | [小满](https://home.meishichina.com/recipe/xiaoman/)     | [芒种](https://home.meishichina.com/recipe/mangzhong/)       | [夏至](https://home.meishichina.com/recipe/xiazhi/)    | [小暑](https://home.meishichina.com/recipe/xiaoshu/)     |
| -------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| [guyu](https://rsshub.app/meishichina/recipe/guyu) | [lixia](https://rsshub.app/meishichina/recipe/lixia) | [xiaoman](https://rsshub.app/meishichina/recipe/xiaoman) | [mangzhong](https://rsshub.app/meishichina/recipe/mangzhong) | [xiazhi](https://rsshub.app/meishichina/recipe/xiazhi) | [xiaoshu](https://rsshub.app/meishichina/recipe/xiaoshu) |

| [大暑](https://home.meishichina.com/recipe/dashu/)   | [立秋](https://home.meishichina.com/recipe/xiqiu/)   | [处暑](https://home.meishichina.com/recipe/chushu/)    | [白露](https://home.meishichina.com/recipe/bailu/)   | [秋分](https://home.meishichina.com/recipe/qiufen/)    | [寒露](https://home.meishichina.com/recipe/hanlu/)   |
| ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| [dashu](https://rsshub.app/meishichina/recipe/dashu) | [xiqiu](https://rsshub.app/meishichina/recipe/xiqiu) | [chushu](https://rsshub.app/meishichina/recipe/chushu) | [bailu](https://rsshub.app/meishichina/recipe/bailu) | [qiufen](https://rsshub.app/meishichina/recipe/qiufen) | [hanlu](https://rsshub.app/meishichina/recipe/hanlu) |

| [霜降](https://home.meishichina.com/recipe/shuangjiang/)         | [小雪](https://home.meishichina.com/recipe/xiaoxue/)     | [大雪](https://home.meishichina.com/recipe/daxue/)   | [小寒](https://home.meishichina.com/recipe/xiaohan/)     | [大寒](https://home.meishichina.com/recipe/dahan/)   | [二月二](https://home.meishichina.com/recipe/eryueer/)   |
| ---------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| [shuangjiang](https://rsshub.app/meishichina/recipe/shuangjiang) | [xiaoxue](https://rsshub.app/meishichina/recipe/xiaoxue) | [daxue](https://rsshub.app/meishichina/recipe/daxue) | [xiaohan](https://rsshub.app/meishichina/recipe/xiaohan) | [dahan](https://rsshub.app/meishichina/recipe/dahan) | [eryueer](https://rsshub.app/meishichina/recipe/eryueer) |

| [母亲节](https://home.meishichina.com/recipe/muqinjie/)    | [父亲节](https://home.meishichina.com/recipe/fuqinjie/)    | [儿童节](https://home.meishichina.com/recipe/ertongjie/)     | [七夕](https://home.meishichina.com/recipe/qixi/)  | [重阳节](https://home.meishichina.com/recipe/chongyangjie/)        | [节日习俗](https://home.meishichina.com/recipe/jierixisu/)   |
| ---------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| [muqinjie](https://rsshub.app/meishichina/recipe/muqinjie) | [fuqinjie](https://rsshub.app/meishichina/recipe/fuqinjie) | [ertongjie](https://rsshub.app/meishichina/recipe/ertongjie) | [qixi](https://rsshub.app/meishichina/recipe/qixi) | [chongyangjie](https://rsshub.app/meishichina/recipe/chongyangjie) | [jierixisu](https://rsshub.app/meishichina/recipe/jierixisu) |

#### 按制作难度

| [简单](https://home.meishichina.com/recipe-type-do-level-view-1.html)                            | [普通](https://home.meishichina.com/recipe-type-do-level-view-2.html)                            | [高级](https://home.meishichina.com/recipe-type-do-level-view-3.html)                            | [神级](https://home.meishichina.com/recipe-type-do-level-view-4.html)                            |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| [recipe-type-do-level-view-1](https://rsshub.app/meishichina/recipe/recipe-type-do-level-view-1) | [recipe-type-do-level-view-2](https://rsshub.app/meishichina/recipe/recipe-type-do-level-view-2) | [recipe-type-do-level-view-3](https://rsshub.app/meishichina/recipe/recipe-type-do-level-view-3) | [recipe-type-do-level-view-4](https://rsshub.app/meishichina/recipe/recipe-type-do-level-view-4) |

#### 按所需时间

| [十分钟](https://home.meishichina.com/recipe-type-do-during-view-1.html)                           | [廿分钟](https://home.meishichina.com/recipe-type-do-during-view-2.html)                           | [半小时](https://home.meishichina.com/recipe-type-do-during-view-3.html)                           | [三刻钟](https://home.meishichina.com/recipe-type-do-during-view-4.html)                           | [一小时](https://home.meishichina.com/recipe-type-do-during-view-5.html)                           | [数小时](https://home.meishichina.com/recipe-type-do-during-view-6.html)                           |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [recipe-type-do-during-view-1](https://rsshub.app/meishichina/recipe/recipe-type-do-during-view-1) | [recipe-type-do-during-view-2](https://rsshub.app/meishichina/recipe/recipe-type-do-during-view-2) | [recipe-type-do-during-view-3](https://rsshub.app/meishichina/recipe/recipe-type-do-during-view-3) | [recipe-type-do-during-view-4](https://rsshub.app/meishichina/recipe/recipe-type-do-during-view-4) | [recipe-type-do-during-view-5](https://rsshub.app/meishichina/recipe/recipe-type-do-during-view-5) | [recipe-type-do-during-view-6](https://rsshub.app/meishichina/recipe/recipe-type-do-during-view-6) |

| [一天](https://home.meishichina.com/recipe-type-do-during-view-7.html)                             | [数天](https://home.meishichina.com/recipe-type-do-during-view-8.html)                             |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [recipe-type-do-during-view-7](https://rsshub.app/meishichina/recipe/recipe-type-do-during-view-7) | [recipe-type-do-during-view-8](https://rsshub.app/meishichina/recipe/recipe-type-do-during-view-8) |

#### 按菜品口味

| [微辣](https://home.meishichina.com/recipe-type-do-cuisine-view-1.html)                              | [中辣](https://home.meishichina.com/recipe-type-do-cuisine-view-2.html)                              | [超辣](https://home.meishichina.com/recipe-type-do-cuisine-view-3.html)                              | [麻辣](https://home.meishichina.com/recipe-type-do-cuisine-view-4.html)                              | [酸辣](https://home.meishichina.com/recipe-type-do-cuisine-view-5.html)                              | [甜辣](https://home.meishichina.com/recipe-type-do-cuisine-view-29.html)                               |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [recipe-type-do-cuisine-view-1](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-1) | [recipe-type-do-cuisine-view-2](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-2) | [recipe-type-do-cuisine-view-3](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-3) | [recipe-type-do-cuisine-view-4](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-4) | [recipe-type-do-cuisine-view-5](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-5) | [recipe-type-do-cuisine-view-29](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-29) |

| [香辣](https://home.meishichina.com/recipe-type-do-cuisine-view-31.html)                               | [酸甜](https://home.meishichina.com/recipe-type-do-cuisine-view-6.html)                              | [酸咸](https://home.meishichina.com/recipe-type-do-cuisine-view-7.html)                              | [咸鲜](https://home.meishichina.com/recipe-type-do-cuisine-view-8.html)                              | [咸甜](https://home.meishichina.com/recipe-type-do-cuisine-view-9.html)                              | [甜味](https://home.meishichina.com/recipe-type-do-cuisine-view-10.html)                               |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [recipe-type-do-cuisine-view-31](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-31) | [recipe-type-do-cuisine-view-6](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-6) | [recipe-type-do-cuisine-view-7](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-7) | [recipe-type-do-cuisine-view-8](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-8) | [recipe-type-do-cuisine-view-9](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-9) | [recipe-type-do-cuisine-view-10](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-10) |

| [苦味](https://home.meishichina.com/recipe-type-do-cuisine-view-11.html)                               | [原味](https://home.meishichina.com/recipe-type-do-cuisine-view-12.html)                               | [清淡](https://home.meishichina.com/recipe-type-do-cuisine-view-13.html)                               | [五香](https://home.meishichina.com/recipe-type-do-cuisine-view-14.html)                               | [鱼香](https://home.meishichina.com/recipe-type-do-cuisine-view-15.html)                               | [葱香](https://home.meishichina.com/recipe-type-do-cuisine-view-16.html)                               |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [recipe-type-do-cuisine-view-11](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-11) | [recipe-type-do-cuisine-view-12](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-12) | [recipe-type-do-cuisine-view-13](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-13) | [recipe-type-do-cuisine-view-14](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-14) | [recipe-type-do-cuisine-view-15](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-15) | [recipe-type-do-cuisine-view-16](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-16) |

| [蒜香](https://home.meishichina.com/recipe-type-do-cuisine-view-17.html)                               | [奶香](https://home.meishichina.com/recipe-type-do-cuisine-view-18.html)                               | [酱香](https://home.meishichina.com/recipe-type-do-cuisine-view-19.html)                               | [糟香](https://home.meishichina.com/recipe-type-do-cuisine-view-20.html)                               | [咖喱](https://home.meishichina.com/recipe-type-do-cuisine-view-21.html)                               | [孜然](https://home.meishichina.com/recipe-type-do-cuisine-view-22.html)                               |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [recipe-type-do-cuisine-view-17](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-17) | [recipe-type-do-cuisine-view-18](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-18) | [recipe-type-do-cuisine-view-19](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-19) | [recipe-type-do-cuisine-view-20](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-20) | [recipe-type-do-cuisine-view-21](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-21) | [recipe-type-do-cuisine-view-22](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-22) |

| [果味](https://home.meishichina.com/recipe-type-do-cuisine-view-23.html)                               | [香草](https://home.meishichina.com/recipe-type-do-cuisine-view-24.html)                               | [怪味](https://home.meishichina.com/recipe-type-do-cuisine-view-25.html)                               | [咸香](https://home.meishichina.com/recipe-type-do-cuisine-view-26.html)                               | [甜香](https://home.meishichina.com/recipe-type-do-cuisine-view-27.html)                               | [麻香](https://home.meishichina.com/recipe-type-do-cuisine-view-28.html)                               |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [recipe-type-do-cuisine-view-23](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-23) | [recipe-type-do-cuisine-view-24](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-24) | [recipe-type-do-cuisine-view-25](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-25) | [recipe-type-do-cuisine-view-26](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-26) | [recipe-type-do-cuisine-view-27](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-27) | [recipe-type-do-cuisine-view-28](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-28) |

| [其他](https://home.meishichina.com/recipe-type-do-cuisine-view-50.html)                               |
| ------------------------------------------------------------------------------------------------------ |
| [recipe-type-do-cuisine-view-50](https://rsshub.app/meishichina/recipe/recipe-type-do-cuisine-view-50) |

#### 按主要工艺

| [烧](https://home.meishichina.com/recipe-type-do-technics-view-1.html)                                 | [炒](https://home.meishichina.com/recipe-type-do-technics-view-2.html)                                 | [爆](https://home.meishichina.com/recipe-type-do-technics-view-3.html)                                 | [焖](https://home.meishichina.com/recipe-type-do-technics-view-4.html)                                 | [炖](https://home.meishichina.com/recipe-type-do-technics-view-5.html)                                 | [蒸](https://home.meishichina.com/recipe-type-do-technics-view-6.html)                                 |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [recipe-type-do-technics-view-1](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-1) | [recipe-type-do-technics-view-2](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-2) | [recipe-type-do-technics-view-3](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-3) | [recipe-type-do-technics-view-4](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-4) | [recipe-type-do-technics-view-5](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-5) | [recipe-type-do-technics-view-6](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-6) |

| [煮](https://home.meishichina.com/recipe-type-do-technics-view-7.html)                                 | [拌](https://home.meishichina.com/recipe-type-do-technics-view-8.html)                                 | [烤](https://home.meishichina.com/recipe-type-do-technics-view-9.html)                                 | [炸](https://home.meishichina.com/recipe-type-do-technics-view-10.html)                                  | [烩](https://home.meishichina.com/recipe-type-do-technics-view-11.html)                                  | [溜](https://home.meishichina.com/recipe-type-do-technics-view-12.html)                                  |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [recipe-type-do-technics-view-7](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-7) | [recipe-type-do-technics-view-8](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-8) | [recipe-type-do-technics-view-9](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-9) | [recipe-type-do-technics-view-10](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-10) | [recipe-type-do-technics-view-11](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-11) | [recipe-type-do-technics-view-12](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-12) |

| [氽](https://home.meishichina.com/recipe-type-do-technics-view-13.html)                                  | [腌](https://home.meishichina.com/recipe-type-do-technics-view-14.html)                                  | [卤](https://home.meishichina.com/recipe-type-do-technics-view-15.html)                                  | [炝](https://home.meishichina.com/recipe-type-do-technics-view-16.html)                                  | [煎](https://home.meishichina.com/recipe-type-do-technics-view-17.html)                                  | [酥](https://home.meishichina.com/recipe-type-do-technics-view-18.html)                                  |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [recipe-type-do-technics-view-13](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-13) | [recipe-type-do-technics-view-14](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-14) | [recipe-type-do-technics-view-15](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-15) | [recipe-type-do-technics-view-16](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-16) | [recipe-type-do-technics-view-17](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-17) | [recipe-type-do-technics-view-18](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-18) |

| [扒](https://home.meishichina.com/recipe-type-do-technics-view-19.html)                                  | [熏](https://home.meishichina.com/recipe-type-do-technics-view-20.html)                                  | [煨](https://home.meishichina.com/recipe-type-do-technics-view-21.html)                                  | [酱](https://home.meishichina.com/recipe-type-do-technics-view-22.html)                                  | [煲](https://home.meishichina.com/recipe-type-do-technics-view-30.html)                                  | [烘焙](https://home.meishichina.com/recipe-type-do-technics-view-23.html)                                |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [recipe-type-do-technics-view-19](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-19) | [recipe-type-do-technics-view-20](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-20) | [recipe-type-do-technics-view-21](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-21) | [recipe-type-do-technics-view-22](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-22) | [recipe-type-do-technics-view-30](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-30) | [recipe-type-do-technics-view-23](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-23) |

| [火锅](https://home.meishichina.com/recipe-type-do-technics-view-24.html)                                | [砂锅](https://home.meishichina.com/recipe-type-do-technics-view-25.html)                                | [拔丝](https://home.meishichina.com/recipe-type-do-technics-view-26.html)                                | [生鲜](https://home.meishichina.com/recipe-type-do-technics-view-27.html)                                | [调味](https://home.meishichina.com/recipe-type-do-technics-view-28.html)                                | [技巧](https://home.meishichina.com/recipe-type-do-technics-view-29.html)                                |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [recipe-type-do-technics-view-24](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-24) | [recipe-type-do-technics-view-25](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-25) | [recipe-type-do-technics-view-26](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-26) | [recipe-type-do-technics-view-27](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-27) | [recipe-type-do-technics-view-28](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-28) | [recipe-type-do-technics-view-29](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-29) |

| [烙](https://home.meishichina.com/recipe-type-do-technics-view-31.html)                                  | [榨汁](https://home.meishichina.com/recipe-type-do-technics-view-32.html)                                | [冷冻](https://home.meishichina.com/recipe-type-do-technics-view-33.html)                                | [焗](https://home.meishichina.com/recipe-type-do-technics-view-34.html)                                  | [焯](https://home.meishichina.com/recipe-type-do-technics-view-35.html)                                  | [干煸](https://home.meishichina.com/recipe-type-do-technics-view-36.html)                                |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [recipe-type-do-technics-view-31](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-31) | [recipe-type-do-technics-view-32](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-32) | [recipe-type-do-technics-view-33](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-33) | [recipe-type-do-technics-view-34](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-34) | [recipe-type-do-technics-view-35](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-35) | [recipe-type-do-technics-view-36](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-36) |

| [干锅](https://home.meishichina.com/recipe-type-do-technics-view-37.html)                                | [铁板](https://home.meishichina.com/recipe-type-do-technics-view-38.html)                                | [微波](https://home.meishichina.com/recipe-type-do-technics-view-39.html)                                | [其他](https://home.meishichina.com/recipe-type-do-technics-view-50.html)                                |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [recipe-type-do-technics-view-37](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-37) | [recipe-type-do-technics-view-38](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-38) | [recipe-type-do-technics-view-39](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-39) | [recipe-type-do-technics-view-50](https://rsshub.app/meishichina/recipe/recipe-type-do-technics-view-50) |

</details>
  `,
    categories: ['new-media'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '最新推荐',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/最新推荐',
        },
        {
            title: '最新发布',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/最新发布',
        },
        {
            title: '热菜',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/热菜',
        },
        {
            title: '凉菜',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/凉菜',
        },
        {
            title: '汤羹',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/汤羹',
        },
        {
            title: '主食',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/主食',
        },
        {
            title: '小吃',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/小吃',
        },
        {
            title: '西餐',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/西餐',
        },
        {
            title: '烘焙',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/烘焙',
        },
        {
            title: '自制食材',
            source: ['home.meishichina.com/recipe.html'],
            target: '/recipe/自制食材',
        },
        {
            title: '常见菜式 - 热菜',
            source: ['home.meishichina.com/recipe/recai/'],
            target: '/recipe/recai',
        },
        {
            title: '常见菜式 - 凉菜',
            source: ['home.meishichina.com/recipe/liangcai/'],
            target: '/recipe/liangcai',
        },
        {
            title: '常见菜式 - 汤羹',
            source: ['home.meishichina.com/recipe/tanggeng/'],
            target: '/recipe/tanggeng',
        },
        {
            title: '常见菜式 - 主食',
            source: ['home.meishichina.com/recipe/zhushi/'],
            target: '/recipe/zhushi',
        },
        {
            title: '常见菜式 - 小吃',
            source: ['home.meishichina.com/recipe/xiaochi/'],
            target: '/recipe/xiaochi',
        },
        {
            title: '常见菜式 - 家常菜',
            source: ['home.meishichina.com/recipe/jiachang/'],
            target: '/recipe/jiachang',
        },
        {
            title: '常见菜式 - 泡酱腌菜',
            source: ['home.meishichina.com/recipe/jiangpaoyancai/'],
            target: '/recipe/jiangpaoyancai',
        },
        {
            title: '常见菜式 - 西餐',
            source: ['home.meishichina.com/recipe/xican/'],
            target: '/recipe/xican',
        },
        {
            title: '常见菜式 - 烘焙',
            source: ['home.meishichina.com/recipe/hongbei/'],
            target: '/recipe/hongbei',
        },
        {
            title: '常见菜式 - 烤箱菜',
            source: ['home.meishichina.com/recipe/kaoxiangcai/'],
            target: '/recipe/kaoxiangcai',
        },
        {
            title: '常见菜式 - 饮品',
            source: ['home.meishichina.com/recipe/yinpin/'],
            target: '/recipe/yinpin',
        },
        {
            title: '常见菜式 - 零食',
            source: ['home.meishichina.com/recipe/lingshi/'],
            target: '/recipe/lingshi',
        },
        {
            title: '常见菜式 - 火锅',
            source: ['home.meishichina.com/recipe/huoguo/'],
            target: '/recipe/huoguo',
        },
        {
            title: '常见菜式 - 自制食材',
            source: ['home.meishichina.com/recipe/zizhishicai/'],
            target: '/recipe/zizhishicai',
        },
        {
            title: '常见菜式 - 海鲜',
            source: ['home.meishichina.com/recipe/haixian/'],
            target: '/recipe/haixian',
        },
        {
            title: '常见菜式 - 宴客菜',
            source: ['home.meishichina.com/recipe/yankecai/'],
            target: '/recipe/yankecai',
        },
        {
            title: '主食/小吃 - 米饭',
            source: ['home.meishichina.com/recipe/mifan/'],
            target: '/recipe/mifan',
        },
        {
            title: '主食/小吃 - 炒饭',
            source: ['home.meishichina.com/recipe/chaofan/'],
            target: '/recipe/chaofan',
        },
        {
            title: '主食/小吃 - 面食',
            source: ['home.meishichina.com/recipe/mianshi/'],
            target: '/recipe/mianshi',
        },
        {
            title: '主食/小吃 - 包子',
            source: ['home.meishichina.com/recipe/baozi/'],
            target: '/recipe/baozi',
        },
        {
            title: '主食/小吃 - 饺子',
            source: ['home.meishichina.com/recipe/jiaozi/'],
            target: '/recipe/jiaozi',
        },
        {
            title: '主食/小吃 - 馒头花卷',
            source: ['home.meishichina.com/recipe/mantou/'],
            target: '/recipe/mantou',
        },
        {
            title: '主食/小吃 - 面条',
            source: ['home.meishichina.com/recipe/miantiao/'],
            target: '/recipe/miantiao',
        },
        {
            title: '主食/小吃 - 饼',
            source: ['home.meishichina.com/recipe/bing/'],
            target: '/recipe/bing',
        },
        {
            title: '主食/小吃 - 粥',
            source: ['home.meishichina.com/recipe/zhou/'],
            target: '/recipe/zhou',
        },
        {
            title: '主食/小吃 - 馄饨',
            source: ['home.meishichina.com/recipe/hundun/'],
            target: '/recipe/hundun',
        },
        {
            title: '主食/小吃 - 五谷杂粮',
            source: ['home.meishichina.com/recipe/wuguzaliang/'],
            target: '/recipe/wuguzaliang',
        },
        {
            title: '主食/小吃 - 北京小吃',
            source: ['home.meishichina.com/recipe/beijingxiaochi/'],
            target: '/recipe/beijingxiaochi',
        },
        {
            title: '主食/小吃 - 陕西小吃',
            source: ['home.meishichina.com/recipe/shanxixiaochi/'],
            target: '/recipe/shanxixiaochi',
        },
        {
            title: '主食/小吃 - 广东小吃',
            source: ['home.meishichina.com/recipe/guangdongxiaochi/'],
            target: '/recipe/guangdongxiaochi',
        },
        {
            title: '主食/小吃 - 四川小吃',
            source: ['home.meishichina.com/recipe/sichuanxiaochi/'],
            target: '/recipe/sichuanxiaochi',
        },
        {
            title: '主食/小吃 - 重庆小吃',
            source: ['home.meishichina.com/recipe/chongqingxiaochi/'],
            target: '/recipe/chongqingxiaochi',
        },
        {
            title: '主食/小吃 - 天津小吃',
            source: ['home.meishichina.com/recipe/tianjinxiaochi/'],
            target: '/recipe/tianjinxiaochi',
        },
        {
            title: '主食/小吃 - 上海小吃',
            source: ['home.meishichina.com/recipe/shanghaixiochi/'],
            target: '/recipe/shanghaixiochi',
        },
        {
            title: '主食/小吃 - 福建小吃',
            source: ['home.meishichina.com/recipe/fujianxiaochi/'],
            target: '/recipe/fujianxiaochi',
        },
        {
            title: '主食/小吃 - 湖南小吃',
            source: ['home.meishichina.com/recipe/hunanxiaochi/'],
            target: '/recipe/hunanxiaochi',
        },
        {
            title: '主食/小吃 - 湖北小吃',
            source: ['home.meishichina.com/recipe/hubeixiaochi/'],
            target: '/recipe/hubeixiaochi',
        },
        {
            title: '主食/小吃 - 江西小吃',
            source: ['home.meishichina.com/recipe/jiangxixiaochi/'],
            target: '/recipe/jiangxixiaochi',
        },
        {
            title: '主食/小吃 - 山东小吃',
            source: ['home.meishichina.com/recipe/shandongxiaochi/'],
            target: '/recipe/shandongxiaochi',
        },
        {
            title: '主食/小吃 - 山西小吃',
            source: ['home.meishichina.com/recipe/jinxiaochi/'],
            target: '/recipe/jinxiaochi',
        },
        {
            title: '主食/小吃 - 河南小吃',
            source: ['home.meishichina.com/recipe/henanxiaochi/'],
            target: '/recipe/henanxiaochi',
        },
        {
            title: '主食/小吃 - 台湾小吃',
            source: ['home.meishichina.com/recipe/taiwanxiaochi/'],
            target: '/recipe/taiwanxiaochi',
        },
        {
            title: '主食/小吃 - 江浙小吃',
            source: ['home.meishichina.com/recipe/jiangzhexiaochi/'],
            target: '/recipe/jiangzhexiaochi',
        },
        {
            title: '主食/小吃 - 云贵小吃',
            source: ['home.meishichina.com/recipe/yunguixiaochi/'],
            target: '/recipe/yunguixiaochi',
        },
        {
            title: '主食/小吃 - 东北小吃',
            source: ['home.meishichina.com/recipe/dongbeixiaochi/'],
            target: '/recipe/dongbeixiaochi',
        },
        {
            title: '主食/小吃 - 西北小吃',
            source: ['home.meishichina.com/recipe/xibeixiaochi/'],
            target: '/recipe/xibeixiaochi',
        },
        {
            title: '甜品/饮品 - 甜品',
            source: ['home.meishichina.com/recipe/tianpin/'],
            target: '/recipe/tianpin',
        },
        {
            title: '甜品/饮品 - 冰品',
            source: ['home.meishichina.com/recipe/bingpin/'],
            target: '/recipe/bingpin',
        },
        {
            title: '甜品/饮品 - 果汁',
            source: ['home.meishichina.com/recipe/guozhi/'],
            target: '/recipe/guozhi',
        },
        {
            title: '甜品/饮品 - 糖水',
            source: ['home.meishichina.com/recipe/tangshui/'],
            target: '/recipe/tangshui',
        },
        {
            title: '甜品/饮品 - 布丁',
            source: ['home.meishichina.com/recipe/buding/'],
            target: '/recipe/buding',
        },
        {
            title: '甜品/饮品 - 果酱',
            source: ['home.meishichina.com/recipe/guojiang/'],
            target: '/recipe/guojiang',
        },
        {
            title: '甜品/饮品 - 果冻',
            source: ['home.meishichina.com/recipe/guodong/'],
            target: '/recipe/guodong',
        },
        {
            title: '甜品/饮品 - 酸奶',
            source: ['home.meishichina.com/recipe/suannai/'],
            target: '/recipe/suannai',
        },
        {
            title: '甜品/饮品 - 鸡尾酒',
            source: ['home.meishichina.com/recipe/jiweijiu/'],
            target: '/recipe/jiweijiu',
        },
        {
            title: '甜品/饮品 - 咖啡',
            source: ['home.meishichina.com/recipe/kafei/'],
            target: '/recipe/kafei',
        },
        {
            title: '甜品/饮品 - 豆浆',
            source: ['home.meishichina.com/recipe/doujiang/'],
            target: '/recipe/doujiang',
        },
        {
            title: '甜品/饮品 - 奶昔',
            source: ['home.meishichina.com/recipe/naixi/'],
            target: '/recipe/naixi',
        },
        {
            title: '甜品/饮品 - 冰淇淋',
            source: ['home.meishichina.com/recipe/bingqilin/'],
            target: '/recipe/bingqilin',
        },
        {
            title: '适宜人群 - 孕妇',
            source: ['home.meishichina.com/recipe/yunfu/'],
            target: '/recipe/yunfu',
        },
        {
            title: '适宜人群 - 产妇',
            source: ['home.meishichina.com/recipe/chanfu/'],
            target: '/recipe/chanfu',
        },
        {
            title: '适宜人群 - 婴儿',
            source: ['home.meishichina.com/recipe/yinger/'],
            target: '/recipe/yinger',
        },
        {
            title: '适宜人群 - 儿童',
            source: ['home.meishichina.com/recipe/ertong/'],
            target: '/recipe/ertong',
        },
        {
            title: '适宜人群 - 老人',
            source: ['home.meishichina.com/recipe/laoren/'],
            target: '/recipe/laoren',
        },
        {
            title: '适宜人群 - 幼儿',
            source: ['home.meishichina.com/recipe/youer/'],
            target: '/recipe/youer',
        },
        {
            title: '适宜人群 - 哺乳期',
            source: ['home.meishichina.com/recipe/buruqi/'],
            target: '/recipe/buruqi',
        },
        {
            title: '适宜人群 - 青少年',
            source: ['home.meishichina.com/recipe/qingshaonian/'],
            target: '/recipe/qingshaonian',
        },
        {
            title: '食疗食补 - 健康食谱',
            source: ['home.meishichina.com/recipe/jiankangshipu/'],
            target: '/recipe/jiankangshipu',
        },
        {
            title: '食疗食补 - 减肥瘦身',
            source: ['home.meishichina.com/recipe/shoushen/'],
            target: '/recipe/shoushen',
        },
        {
            title: '食疗食补 - 贫血',
            source: ['home.meishichina.com/recipe/pinxue/'],
            target: '/recipe/pinxue',
        },
        {
            title: '食疗食补 - 痛经',
            source: ['home.meishichina.com/recipe/tongjing/'],
            target: '/recipe/tongjing',
        },
        {
            title: '食疗食补 - 清热祛火',
            source: ['home.meishichina.com/recipe/qingrequhuo/'],
            target: '/recipe/qingrequhuo',
        },
        {
            title: '食疗食补 - 滋阴',
            source: ['home.meishichina.com/recipe/ziyin/'],
            target: '/recipe/ziyin',
        },
        {
            title: '食疗食补 - 壮阳',
            source: ['home.meishichina.com/recipe/zhuangyang/'],
            target: '/recipe/zhuangyang',
        },
        {
            title: '食疗食补 - 便秘',
            source: ['home.meishichina.com/recipe/bianmi/'],
            target: '/recipe/bianmi',
        },
        {
            title: '食疗食补 - 排毒养颜',
            source: ['home.meishichina.com/recipe/paiduyangyan/'],
            target: '/recipe/paiduyangyan',
        },
        {
            title: '食疗食补 - 滋润补水',
            source: ['home.meishichina.com/recipe/ziyinbushuui/'],
            target: '/recipe/ziyinbushuui',
        },
        {
            title: '食疗食补 - 健脾养胃',
            source: ['home.meishichina.com/recipe/jianbiyangwei/'],
            target: '/recipe/jianbiyangwei',
        },
        {
            title: '食疗食补 - 护肝明目',
            source: ['home.meishichina.com/recipe/huganmingmu/'],
            target: '/recipe/huganmingmu',
        },
        {
            title: '食疗食补 - 清肺止咳',
            source: ['home.meishichina.com/recipe/qingfeizhike/'],
            target: '/recipe/qingfeizhike',
        },
        {
            title: '食疗食补 - 下奶',
            source: ['home.meishichina.com/recipe/xianai/'],
            target: '/recipe/xianai',
        },
        {
            title: '食疗食补 - 补钙',
            source: ['home.meishichina.com/recipe/bugai/'],
            target: '/recipe/bugai',
        },
        {
            title: '食疗食补 - 醒酒',
            source: ['home.meishichina.com/recipe/xingjiu/'],
            target: '/recipe/xingjiu',
        },
        {
            title: '食疗食补 - 抗过敏',
            source: ['home.meishichina.com/recipe/kangguomin/'],
            target: '/recipe/kangguomin',
        },
        {
            title: '食疗食补 - 防辐射',
            source: ['home.meishichina.com/recipe/fangfushe/'],
            target: '/recipe/fangfushe',
        },
        {
            title: '食疗食补 - 提高免疫力',
            source: ['home.meishichina.com/recipe/tigaomianyili/'],
            target: '/recipe/tigaomianyili',
        },
        {
            title: '食疗食补 - 流感',
            source: ['home.meishichina.com/recipe/liugan/'],
            target: '/recipe/liugan',
        },
        {
            title: '食疗食补 - 驱寒暖身',
            source: ['home.meishichina.com/recipe/quhannuanshen/'],
            target: '/recipe/quhannuanshen',
        },
        {
            title: '食疗食补 - 秋冬进补',
            source: ['home.meishichina.com/recipe/qiudongjinbu/'],
            target: '/recipe/qiudongjinbu',
        },
        {
            title: '食疗食补 - 消暑解渴',
            source: ['home.meishichina.com/recipe/xiaoshujieke/'],
            target: '/recipe/xiaoshujieke',
        },
        {
            title: '场景 - 早餐',
            source: ['home.meishichina.com/recipe/zaocan/'],
            target: '/recipe/zaocan',
        },
        {
            title: '场景 - 下午茶',
            source: ['home.meishichina.com/recipe/xiawucha/'],
            target: '/recipe/xiawucha',
        },
        {
            title: '场景 - 二人世界',
            source: ['home.meishichina.com/recipe/erren/'],
            target: '/recipe/erren',
        },
        {
            title: '场景 - 野餐',
            source: ['home.meishichina.com/recipe/yecan/'],
            target: '/recipe/yecan',
        },
        {
            title: '场景 - 开胃菜',
            source: ['home.meishichina.com/recipe/kaiweicai/'],
            target: '/recipe/kaiweicai',
        },
        {
            title: '场景 - 私房菜',
            source: ['home.meishichina.com/recipe/sifangcai/'],
            target: '/recipe/sifangcai',
        },
        {
            title: '场景 - 快餐',
            source: ['home.meishichina.com/recipe/kuaican/'],
            target: '/recipe/kuaican',
        },
        {
            title: '场景 - 快手菜',
            source: ['home.meishichina.com/recipe/kuaishoucai/'],
            target: '/recipe/kuaishoucai',
        },
        {
            title: '场景 - 宿舍时代',
            source: ['home.meishichina.com/recipe/susheshidai/'],
            target: '/recipe/susheshidai',
        },
        {
            title: '场景 - 中式宴请',
            source: ['home.meishichina.com/recipe/zhongshiyanqing/'],
            target: '/recipe/zhongshiyanqing',
        },
        {
            title: '场景 - 西式宴请',
            source: ['home.meishichina.com/recipe/xishiyanqing/'],
            target: '/recipe/xishiyanqing',
        },
        {
            title: '饮食方式 - 素食',
            source: ['home.meishichina.com/recipe/sushi/'],
            target: '/recipe/sushi',
        },
        {
            title: '饮食方式 - 素菜',
            source: ['home.meishichina.com/recipe/sucai2/'],
            target: '/recipe/sucai2',
        },
        {
            title: '饮食方式 - 清真菜',
            source: ['home.meishichina.com/recipe/qingzhencai/'],
            target: '/recipe/qingzhencai',
        },
        {
            title: '饮食方式 - 春季食谱',
            source: ['home.meishichina.com/recipe/chunji/'],
            target: '/recipe/chunji',
        },
        {
            title: '饮食方式 - 夏季食谱',
            source: ['home.meishichina.com/recipe/xiaji/'],
            target: '/recipe/xiaji',
        },
        {
            title: '饮食方式 - 秋季食谱',
            source: ['home.meishichina.com/recipe/qiuji/'],
            target: '/recipe/qiuji',
        },
        {
            title: '饮食方式 - 冬季食谱',
            source: ['home.meishichina.com/recipe/dongji/'],
            target: '/recipe/dongji',
        },
        {
            title: '饮食方式 - 小清新',
            source: ['home.meishichina.com/recipe/xiaoqingxin/'],
            target: '/recipe/xiaoqingxin',
        },
        {
            title: '饮食方式 - 高颜值',
            source: ['home.meishichina.com/recipe/gaoyanzhi/'],
            target: '/recipe/gaoyanzhi',
        },
        {
            title: '中式菜系 - 川菜',
            source: ['home.meishichina.com/recipe/chuancai/'],
            target: '/recipe/chuancai',
        },
        {
            title: '中式菜系 - 鲁菜',
            source: ['home.meishichina.com/recipe/lucai/'],
            target: '/recipe/lucai',
        },
        {
            title: '中式菜系 - 闽菜',
            source: ['home.meishichina.com/recipe/mincai/'],
            target: '/recipe/mincai',
        },
        {
            title: '中式菜系 - 粤菜',
            source: ['home.meishichina.com/recipe/yuecai/'],
            target: '/recipe/yuecai',
        },
        {
            title: '中式菜系 - 苏菜',
            source: ['home.meishichina.com/recipe/sucai/'],
            target: '/recipe/sucai',
        },
        {
            title: '中式菜系 - 浙菜',
            source: ['home.meishichina.com/recipe/zhecai/'],
            target: '/recipe/zhecai',
        },
        {
            title: '中式菜系 - 湘菜',
            source: ['home.meishichina.com/recipe/xiangcai/'],
            target: '/recipe/xiangcai',
        },
        {
            title: '中式菜系 - 徽菜',
            source: ['home.meishichina.com/recipe/huicai/'],
            target: '/recipe/huicai',
        },
        {
            title: '中式菜系 - 淮扬菜',
            source: ['home.meishichina.com/recipe/huaiyangcai/'],
            target: '/recipe/huaiyangcai',
        },
        {
            title: '中式菜系 - 豫菜',
            source: ['home.meishichina.com/recipe/yucai/'],
            target: '/recipe/yucai',
        },
        {
            title: '中式菜系 - 晋菜',
            source: ['home.meishichina.com/recipe/jincai/'],
            target: '/recipe/jincai',
        },
        {
            title: '中式菜系 - 鄂菜',
            source: ['home.meishichina.com/recipe/ecai/'],
            target: '/recipe/ecai',
        },
        {
            title: '中式菜系 - 云南菜',
            source: ['home.meishichina.com/recipe/yunnancai/'],
            target: '/recipe/yunnancai',
        },
        {
            title: '中式菜系 - 北京菜',
            source: ['home.meishichina.com/recipe/beijingcai/'],
            target: '/recipe/beijingcai',
        },
        {
            title: '中式菜系 - 东北菜',
            source: ['home.meishichina.com/recipe/dongbeicai/'],
            target: '/recipe/dongbeicai',
        },
        {
            title: '中式菜系 - 西北菜',
            source: ['home.meishichina.com/recipe/xibeicai/'],
            target: '/recipe/xibeicai',
        },
        {
            title: '中式菜系 - 贵州菜',
            source: ['home.meishichina.com/recipe/guizhoucai/'],
            target: '/recipe/guizhoucai',
        },
        {
            title: '中式菜系 - 上海菜',
            source: ['home.meishichina.com/recipe/shanghaicai/'],
            target: '/recipe/shanghaicai',
        },
        {
            title: '中式菜系 - 新疆菜',
            source: ['home.meishichina.com/recipe/xinjiangcai/'],
            target: '/recipe/xinjiangcai',
        },
        {
            title: '中式菜系 - 客家菜',
            source: ['home.meishichina.com/recipe/kejiacai/'],
            target: '/recipe/kejiacai',
        },
        {
            title: '中式菜系 - 台湾美食',
            source: ['home.meishichina.com/recipe/taiwancai/'],
            target: '/recipe/taiwancai',
        },
        {
            title: '中式菜系 - 香港美食',
            source: ['home.meishichina.com/recipe/xianggangcai/'],
            target: '/recipe/xianggangcai',
        },
        {
            title: '中式菜系 - 澳门美食',
            source: ['home.meishichina.com/recipe/aomeicai/'],
            target: '/recipe/aomeicai',
        },
        {
            title: '中式菜系 - 赣菜',
            source: ['home.meishichina.com/recipe/gancai/'],
            target: '/recipe/gancai',
        },
        {
            title: '中式菜系 - 中式菜系',
            source: ['home.meishichina.com/recipe/zhongshicaixi/'],
            target: '/recipe/zhongshicaixi',
        },
        {
            title: '外国美食 - 日本料理',
            source: ['home.meishichina.com/recipe/ribencai/'],
            target: '/recipe/ribencai',
        },
        {
            title: '外国美食 - 韩国料理',
            source: ['home.meishichina.com/recipe/hanguocai/'],
            target: '/recipe/hanguocai',
        },
        {
            title: '外国美食 - 泰国菜',
            source: ['home.meishichina.com/recipe/taiguocai/'],
            target: '/recipe/taiguocai',
        },
        {
            title: '外国美食 - 印度菜',
            source: ['home.meishichina.com/recipe/yiducai/'],
            target: '/recipe/yiducai',
        },
        {
            title: '外国美食 - 法国菜',
            source: ['home.meishichina.com/recipe/faguocai/'],
            target: '/recipe/faguocai',
        },
        {
            title: '外国美食 - 意大利菜',
            source: ['home.meishichina.com/recipe/yidalicai/'],
            target: '/recipe/yidalicai',
        },
        {
            title: '外国美食 - 西班牙菜',
            source: ['home.meishichina.com/recipe/xibanya/'],
            target: '/recipe/xibanya',
        },
        {
            title: '外国美食 - 英国菜',
            source: ['home.meishichina.com/recipe/yingguocai/'],
            target: '/recipe/yingguocai',
        },
        {
            title: '外国美食 - 越南菜',
            source: ['home.meishichina.com/recipe/yuenancai/'],
            target: '/recipe/yuenancai',
        },
        {
            title: '外国美食 - 墨西哥菜',
            source: ['home.meishichina.com/recipe/moxigecai/'],
            target: '/recipe/moxigecai',
        },
        {
            title: '外国美食 - 外国美食',
            source: ['home.meishichina.com/recipe/waiguomeishi/'],
            target: '/recipe/waiguomeishi',
        },
        {
            title: '烘焙 - 蛋糕',
            source: ['home.meishichina.com/recipe/dangao/'],
            target: '/recipe/dangao',
        },
        {
            title: '烘焙 - 面包',
            source: ['home.meishichina.com/recipe/mianbao/'],
            target: '/recipe/mianbao',
        },
        {
            title: '烘焙 - 饼干',
            source: ['home.meishichina.com/recipe/binggan/'],
            target: '/recipe/binggan',
        },
        {
            title: '烘焙 - 派塔',
            source: ['home.meishichina.com/recipe/paita/'],
            target: '/recipe/paita',
        },
        {
            title: '烘焙 - 吐司',
            source: ['home.meishichina.com/recipe/tusi/'],
            target: '/recipe/tusi',
        },
        {
            title: '烘焙 - 戚风蛋糕',
            source: ['home.meishichina.com/recipe/qifeng/'],
            target: '/recipe/qifeng',
        },
        {
            title: '烘焙 - 纸杯蛋糕',
            source: ['home.meishichina.com/recipe/zhibei/'],
            target: '/recipe/zhibei',
        },
        {
            title: '烘焙 - 蛋糕卷',
            source: ['home.meishichina.com/recipe/dangaojuan/'],
            target: '/recipe/dangaojuan',
        },
        {
            title: '烘焙 - 玛芬蛋糕',
            source: ['home.meishichina.com/recipe/mafen/'],
            target: '/recipe/mafen',
        },
        {
            title: '烘焙 - 乳酪蛋糕',
            source: ['home.meishichina.com/recipe/rulao/'],
            target: '/recipe/rulao',
        },
        {
            title: '烘焙 - 芝士蛋糕',
            source: ['home.meishichina.com/recipe/zhishi/'],
            target: '/recipe/zhishi',
        },
        {
            title: '烘焙 - 奶油蛋糕',
            source: ['home.meishichina.com/recipe/naiyou/'],
            target: '/recipe/naiyou',
        },
        {
            title: '烘焙 - 批萨',
            source: ['home.meishichina.com/recipe/pisa/'],
            target: '/recipe/pisa',
        },
        {
            title: '烘焙 - 慕斯',
            source: ['home.meishichina.com/recipe/musi/'],
            target: '/recipe/musi',
        },
        {
            title: '烘焙 - 曲奇',
            source: ['home.meishichina.com/recipe/quqi/'],
            target: '/recipe/quqi',
        },
        {
            title: '烘焙 - 翻糖',
            source: ['home.meishichina.com/recipe/fantang/'],
            target: '/recipe/fantang',
        },
        {
            title: '传统美食 - 粽子',
            source: ['home.meishichina.com/recipe/zongzi/'],
            target: '/recipe/zongzi',
        },
        {
            title: '传统美食 - 月饼',
            source: ['home.meishichina.com/recipe/yuebing/'],
            target: '/recipe/yuebing',
        },
        {
            title: '传统美食 - 春饼',
            source: ['home.meishichina.com/recipe/chunbing/'],
            target: '/recipe/chunbing',
        },
        {
            title: '传统美食 - 元宵',
            source: ['home.meishichina.com/recipe/yuanxiao/'],
            target: '/recipe/yuanxiao',
        },
        {
            title: '传统美食 - 汤圆',
            source: ['home.meishichina.com/recipe/tangyuan/'],
            target: '/recipe/tangyuan',
        },
        {
            title: '传统美食 - 青团',
            source: ['home.meishichina.com/recipe/qingtuan/'],
            target: '/recipe/qingtuan',
        },
        {
            title: '传统美食 - 腊八粥',
            source: ['home.meishichina.com/recipe/labazhou/'],
            target: '/recipe/labazhou',
        },
        {
            title: '传统美食 - 春卷',
            source: ['home.meishichina.com/recipe/chunjuan/'],
            target: '/recipe/chunjuan',
        },
        {
            title: '传统美食 - 传统美食',
            source: ['home.meishichina.com/recipe/chuantongmeishi/'],
            target: '/recipe/chuantongmeishi',
        },
        {
            title: '节日食俗 - 立冬',
            source: ['home.meishichina.com/recipe/lidong/'],
            target: '/recipe/lidong',
        },
        {
            title: '节日食俗 - 冬至',
            source: ['home.meishichina.com/recipe/dongzhi/'],
            target: '/recipe/dongzhi',
        },
        {
            title: '节日食俗 - 腊八',
            source: ['home.meishichina.com/recipe/laba/'],
            target: '/recipe/laba',
        },
        {
            title: '节日食俗 - 端午节',
            source: ['home.meishichina.com/recipe/duanwu/'],
            target: '/recipe/duanwu',
        },
        {
            title: '节日食俗 - 中秋',
            source: ['home.meishichina.com/recipe/zhongqiu/'],
            target: '/recipe/zhongqiu',
        },
        {
            title: '节日食俗 - 立春',
            source: ['home.meishichina.com/recipe/lichun/'],
            target: '/recipe/lichun',
        },
        {
            title: '节日食俗 - 元宵节',
            source: ['home.meishichina.com/recipe/yuanxiaojie/'],
            target: '/recipe/yuanxiaojie',
        },
        {
            title: '节日食俗 - 贴秋膘',
            source: ['home.meishichina.com/recipe/tieqiubiao/'],
            target: '/recipe/tieqiubiao',
        },
        {
            title: '节日食俗 - 清明',
            source: ['home.meishichina.com/recipe/qingming/'],
            target: '/recipe/qingming',
        },
        {
            title: '节日食俗 - 年夜饭',
            source: ['home.meishichina.com/recipe/nianyefan/'],
            target: '/recipe/nianyefan',
        },
        {
            title: '节日食俗 - 圣诞节',
            source: ['home.meishichina.com/recipe/shengdanjie/'],
            target: '/recipe/shengdanjie',
        },
        {
            title: '节日食俗 - 感恩节',
            source: ['home.meishichina.com/recipe/ganenjie/'],
            target: '/recipe/ganenjie',
        },
        {
            title: '节日食俗 - 万圣节',
            source: ['home.meishichina.com/recipe/wanshengjie/'],
            target: '/recipe/wanshengjie',
        },
        {
            title: '节日食俗 - 情人节',
            source: ['home.meishichina.com/recipe/qingrenjie/'],
            target: '/recipe/qingrenjie',
        },
        {
            title: '节日食俗 - 复活节',
            source: ['home.meishichina.com/recipe/fuhuojie/'],
            target: '/recipe/fuhuojie',
        },
        {
            title: '节日食俗 - 雨水',
            source: ['home.meishichina.com/recipe/yushui/'],
            target: '/recipe/yushui',
        },
        {
            title: '节日食俗 - 惊蛰',
            source: ['home.meishichina.com/recipe/jingzhi/'],
            target: '/recipe/jingzhi',
        },
        {
            title: '节日食俗 - 春分',
            source: ['home.meishichina.com/recipe/chunfen/'],
            target: '/recipe/chunfen',
        },
        {
            title: '节日食俗 - 谷雨',
            source: ['home.meishichina.com/recipe/guyu/'],
            target: '/recipe/guyu',
        },
        {
            title: '节日食俗 - 立夏',
            source: ['home.meishichina.com/recipe/lixia/'],
            target: '/recipe/lixia',
        },
        {
            title: '节日食俗 - 小满',
            source: ['home.meishichina.com/recipe/xiaoman/'],
            target: '/recipe/xiaoman',
        },
        {
            title: '节日食俗 - 芒种',
            source: ['home.meishichina.com/recipe/mangzhong/'],
            target: '/recipe/mangzhong',
        },
        {
            title: '节日食俗 - 夏至',
            source: ['home.meishichina.com/recipe/xiazhi/'],
            target: '/recipe/xiazhi',
        },
        {
            title: '节日食俗 - 小暑',
            source: ['home.meishichina.com/recipe/xiaoshu/'],
            target: '/recipe/xiaoshu',
        },
        {
            title: '节日食俗 - 大暑',
            source: ['home.meishichina.com/recipe/dashu/'],
            target: '/recipe/dashu',
        },
        {
            title: '节日食俗 - 立秋',
            source: ['home.meishichina.com/recipe/xiqiu/'],
            target: '/recipe/xiqiu',
        },
        {
            title: '节日食俗 - 处暑',
            source: ['home.meishichina.com/recipe/chushu/'],
            target: '/recipe/chushu',
        },
        {
            title: '节日食俗 - 白露',
            source: ['home.meishichina.com/recipe/bailu/'],
            target: '/recipe/bailu',
        },
        {
            title: '节日食俗 - 秋分',
            source: ['home.meishichina.com/recipe/qiufen/'],
            target: '/recipe/qiufen',
        },
        {
            title: '节日食俗 - 寒露',
            source: ['home.meishichina.com/recipe/hanlu/'],
            target: '/recipe/hanlu',
        },
        {
            title: '节日食俗 - 霜降',
            source: ['home.meishichina.com/recipe/shuangjiang/'],
            target: '/recipe/shuangjiang',
        },
        {
            title: '节日食俗 - 小雪',
            source: ['home.meishichina.com/recipe/xiaoxue/'],
            target: '/recipe/xiaoxue',
        },
        {
            title: '节日食俗 - 大雪',
            source: ['home.meishichina.com/recipe/daxue/'],
            target: '/recipe/daxue',
        },
        {
            title: '节日食俗 - 小寒',
            source: ['home.meishichina.com/recipe/xiaohan/'],
            target: '/recipe/xiaohan',
        },
        {
            title: '节日食俗 - 大寒',
            source: ['home.meishichina.com/recipe/dahan/'],
            target: '/recipe/dahan',
        },
        {
            title: '节日食俗 - 二月二',
            source: ['home.meishichina.com/recipe/eryueer/'],
            target: '/recipe/eryueer',
        },
        {
            title: '节日食俗 - 母亲节',
            source: ['home.meishichina.com/recipe/muqinjie/'],
            target: '/recipe/muqinjie',
        },
        {
            title: '节日食俗 - 父亲节',
            source: ['home.meishichina.com/recipe/fuqinjie/'],
            target: '/recipe/fuqinjie',
        },
        {
            title: '节日食俗 - 儿童节',
            source: ['home.meishichina.com/recipe/ertongjie/'],
            target: '/recipe/ertongjie',
        },
        {
            title: '节日食俗 - 七夕',
            source: ['home.meishichina.com/recipe/qixi/'],
            target: '/recipe/qixi',
        },
        {
            title: '节日食俗 - 重阳节',
            source: ['home.meishichina.com/recipe/chongyangjie/'],
            target: '/recipe/chongyangjie',
        },
        {
            title: '节日食俗 - 节日习俗',
            source: ['home.meishichina.com/recipe/jierixisu/'],
            target: '/recipe/jierixisu',
        },
        {
            title: '按制作难度 - 简单',
            source: ['home.meishichina.com/recipe-type-do-level-view-1.html'],
            target: '/recipe/recipe-type-do-level-view-1',
        },
        {
            title: '按制作难度 - 普通',
            source: ['home.meishichina.com/recipe-type-do-level-view-2.html'],
            target: '/recipe/recipe-type-do-level-view-2',
        },
        {
            title: '按制作难度 - 高级',
            source: ['home.meishichina.com/recipe-type-do-level-view-3.html'],
            target: '/recipe/recipe-type-do-level-view-3',
        },
        {
            title: '按制作难度 - 神级',
            source: ['home.meishichina.com/recipe-type-do-level-view-4.html'],
            target: '/recipe/recipe-type-do-level-view-4',
        },
        {
            title: '按所需时间 - 十分钟',
            source: ['home.meishichina.com/recipe-type-do-during-view-1.html'],
            target: '/recipe/recipe-type-do-during-view-1',
        },
        {
            title: '按所需时间 - 廿分钟',
            source: ['home.meishichina.com/recipe-type-do-during-view-2.html'],
            target: '/recipe/recipe-type-do-during-view-2',
        },
        {
            title: '按所需时间 - 半小时',
            source: ['home.meishichina.com/recipe-type-do-during-view-3.html'],
            target: '/recipe/recipe-type-do-during-view-3',
        },
        {
            title: '按所需时间 - 三刻钟',
            source: ['home.meishichina.com/recipe-type-do-during-view-4.html'],
            target: '/recipe/recipe-type-do-during-view-4',
        },
        {
            title: '按所需时间 - 一小时',
            source: ['home.meishichina.com/recipe-type-do-during-view-5.html'],
            target: '/recipe/recipe-type-do-during-view-5',
        },
        {
            title: '按所需时间 - 数小时',
            source: ['home.meishichina.com/recipe-type-do-during-view-6.html'],
            target: '/recipe/recipe-type-do-during-view-6',
        },
        {
            title: '按所需时间 - 一天',
            source: ['home.meishichina.com/recipe-type-do-during-view-7.html'],
            target: '/recipe/recipe-type-do-during-view-7',
        },
        {
            title: '按所需时间 - 数天',
            source: ['home.meishichina.com/recipe-type-do-during-view-8.html'],
            target: '/recipe/recipe-type-do-during-view-8',
        },
        {
            title: '按菜品口味 - 微辣',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-1.html'],
            target: '/recipe/recipe-type-do-cuisine-view-1',
        },
        {
            title: '按菜品口味 - 中辣',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-2.html'],
            target: '/recipe/recipe-type-do-cuisine-view-2',
        },
        {
            title: '按菜品口味 - 超辣',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-3.html'],
            target: '/recipe/recipe-type-do-cuisine-view-3',
        },
        {
            title: '按菜品口味 - 麻辣',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-4.html'],
            target: '/recipe/recipe-type-do-cuisine-view-4',
        },
        {
            title: '按菜品口味 - 酸辣',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-5.html'],
            target: '/recipe/recipe-type-do-cuisine-view-5',
        },
        {
            title: '按菜品口味 - 甜辣',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-29.html'],
            target: '/recipe/recipe-type-do-cuisine-view-29',
        },
        {
            title: '按菜品口味 - 香辣',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-31.html'],
            target: '/recipe/recipe-type-do-cuisine-view-31',
        },
        {
            title: '按菜品口味 - 酸甜',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-6.html'],
            target: '/recipe/recipe-type-do-cuisine-view-6',
        },
        {
            title: '按菜品口味 - 酸咸',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-7.html'],
            target: '/recipe/recipe-type-do-cuisine-view-7',
        },
        {
            title: '按菜品口味 - 咸鲜',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-8.html'],
            target: '/recipe/recipe-type-do-cuisine-view-8',
        },
        {
            title: '按菜品口味 - 咸甜',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-9.html'],
            target: '/recipe/recipe-type-do-cuisine-view-9',
        },
        {
            title: '按菜品口味 - 甜味',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-10.html'],
            target: '/recipe/recipe-type-do-cuisine-view-10',
        },
        {
            title: '按菜品口味 - 苦味',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-11.html'],
            target: '/recipe/recipe-type-do-cuisine-view-11',
        },
        {
            title: '按菜品口味 - 原味',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-12.html'],
            target: '/recipe/recipe-type-do-cuisine-view-12',
        },
        {
            title: '按菜品口味 - 清淡',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-13.html'],
            target: '/recipe/recipe-type-do-cuisine-view-13',
        },
        {
            title: '按菜品口味 - 五香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-14.html'],
            target: '/recipe/recipe-type-do-cuisine-view-14',
        },
        {
            title: '按菜品口味 - 鱼香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-15.html'],
            target: '/recipe/recipe-type-do-cuisine-view-15',
        },
        {
            title: '按菜品口味 - 葱香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-16.html'],
            target: '/recipe/recipe-type-do-cuisine-view-16',
        },
        {
            title: '按菜品口味 - 蒜香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-17.html'],
            target: '/recipe/recipe-type-do-cuisine-view-17',
        },
        {
            title: '按菜品口味 - 奶香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-18.html'],
            target: '/recipe/recipe-type-do-cuisine-view-18',
        },
        {
            title: '按菜品口味 - 酱香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-19.html'],
            target: '/recipe/recipe-type-do-cuisine-view-19',
        },
        {
            title: '按菜品口味 - 糟香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-20.html'],
            target: '/recipe/recipe-type-do-cuisine-view-20',
        },
        {
            title: '按菜品口味 - 咖喱',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-21.html'],
            target: '/recipe/recipe-type-do-cuisine-view-21',
        },
        {
            title: '按菜品口味 - 孜然',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-22.html'],
            target: '/recipe/recipe-type-do-cuisine-view-22',
        },
        {
            title: '按菜品口味 - 果味',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-23.html'],
            target: '/recipe/recipe-type-do-cuisine-view-23',
        },
        {
            title: '按菜品口味 - 香草',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-24.html'],
            target: '/recipe/recipe-type-do-cuisine-view-24',
        },
        {
            title: '按菜品口味 - 怪味',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-25.html'],
            target: '/recipe/recipe-type-do-cuisine-view-25',
        },
        {
            title: '按菜品口味 - 咸香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-26.html'],
            target: '/recipe/recipe-type-do-cuisine-view-26',
        },
        {
            title: '按菜品口味 - 甜香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-27.html'],
            target: '/recipe/recipe-type-do-cuisine-view-27',
        },
        {
            title: '按菜品口味 - 麻香',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-28.html'],
            target: '/recipe/recipe-type-do-cuisine-view-28',
        },
        {
            title: '按菜品口味 - 其他',
            source: ['home.meishichina.com/recipe-type-do-cuisine-view-50.html'],
            target: '/recipe/recipe-type-do-cuisine-view-50',
        },
        {
            title: '按主要工艺 - 烧',
            source: ['home.meishichina.com/recipe-type-do-technics-view-1.html'],
            target: '/recipe/recipe-type-do-technics-view-1',
        },
        {
            title: '按主要工艺 - 炒',
            source: ['home.meishichina.com/recipe-type-do-technics-view-2.html'],
            target: '/recipe/recipe-type-do-technics-view-2',
        },
        {
            title: '按主要工艺 - 爆',
            source: ['home.meishichina.com/recipe-type-do-technics-view-3.html'],
            target: '/recipe/recipe-type-do-technics-view-3',
        },
        {
            title: '按主要工艺 - 焖',
            source: ['home.meishichina.com/recipe-type-do-technics-view-4.html'],
            target: '/recipe/recipe-type-do-technics-view-4',
        },
        {
            title: '按主要工艺 - 炖',
            source: ['home.meishichina.com/recipe-type-do-technics-view-5.html'],
            target: '/recipe/recipe-type-do-technics-view-5',
        },
        {
            title: '按主要工艺 - 蒸',
            source: ['home.meishichina.com/recipe-type-do-technics-view-6.html'],
            target: '/recipe/recipe-type-do-technics-view-6',
        },
        {
            title: '按主要工艺 - 煮',
            source: ['home.meishichina.com/recipe-type-do-technics-view-7.html'],
            target: '/recipe/recipe-type-do-technics-view-7',
        },
        {
            title: '按主要工艺 - 拌',
            source: ['home.meishichina.com/recipe-type-do-technics-view-8.html'],
            target: '/recipe/recipe-type-do-technics-view-8',
        },
        {
            title: '按主要工艺 - 烤',
            source: ['home.meishichina.com/recipe-type-do-technics-view-9.html'],
            target: '/recipe/recipe-type-do-technics-view-9',
        },
        {
            title: '按主要工艺 - 炸',
            source: ['home.meishichina.com/recipe-type-do-technics-view-10.html'],
            target: '/recipe/recipe-type-do-technics-view-10',
        },
        {
            title: '按主要工艺 - 烩',
            source: ['home.meishichina.com/recipe-type-do-technics-view-11.html'],
            target: '/recipe/recipe-type-do-technics-view-11',
        },
        {
            title: '按主要工艺 - 溜',
            source: ['home.meishichina.com/recipe-type-do-technics-view-12.html'],
            target: '/recipe/recipe-type-do-technics-view-12',
        },
        {
            title: '按主要工艺 - 氽',
            source: ['home.meishichina.com/recipe-type-do-technics-view-13.html'],
            target: '/recipe/recipe-type-do-technics-view-13',
        },
        {
            title: '按主要工艺 - 腌',
            source: ['home.meishichina.com/recipe-type-do-technics-view-14.html'],
            target: '/recipe/recipe-type-do-technics-view-14',
        },
        {
            title: '按主要工艺 - 卤',
            source: ['home.meishichina.com/recipe-type-do-technics-view-15.html'],
            target: '/recipe/recipe-type-do-technics-view-15',
        },
        {
            title: '按主要工艺 - 炝',
            source: ['home.meishichina.com/recipe-type-do-technics-view-16.html'],
            target: '/recipe/recipe-type-do-technics-view-16',
        },
        {
            title: '按主要工艺 - 煎',
            source: ['home.meishichina.com/recipe-type-do-technics-view-17.html'],
            target: '/recipe/recipe-type-do-technics-view-17',
        },
        {
            title: '按主要工艺 - 酥',
            source: ['home.meishichina.com/recipe-type-do-technics-view-18.html'],
            target: '/recipe/recipe-type-do-technics-view-18',
        },
        {
            title: '按主要工艺 - 扒',
            source: ['home.meishichina.com/recipe-type-do-technics-view-19.html'],
            target: '/recipe/recipe-type-do-technics-view-19',
        },
        {
            title: '按主要工艺 - 熏',
            source: ['home.meishichina.com/recipe-type-do-technics-view-20.html'],
            target: '/recipe/recipe-type-do-technics-view-20',
        },
        {
            title: '按主要工艺 - 煨',
            source: ['home.meishichina.com/recipe-type-do-technics-view-21.html'],
            target: '/recipe/recipe-type-do-technics-view-21',
        },
        {
            title: '按主要工艺 - 酱',
            source: ['home.meishichina.com/recipe-type-do-technics-view-22.html'],
            target: '/recipe/recipe-type-do-technics-view-22',
        },
        {
            title: '按主要工艺 - 煲',
            source: ['home.meishichina.com/recipe-type-do-technics-view-30.html'],
            target: '/recipe/recipe-type-do-technics-view-30',
        },
        {
            title: '按主要工艺 - 烘焙',
            source: ['home.meishichina.com/recipe-type-do-technics-view-23.html'],
            target: '/recipe/recipe-type-do-technics-view-23',
        },
        {
            title: '按主要工艺 - 火锅',
            source: ['home.meishichina.com/recipe-type-do-technics-view-24.html'],
            target: '/recipe/recipe-type-do-technics-view-24',
        },
        {
            title: '按主要工艺 - 砂锅',
            source: ['home.meishichina.com/recipe-type-do-technics-view-25.html'],
            target: '/recipe/recipe-type-do-technics-view-25',
        },
        {
            title: '按主要工艺 - 拔丝',
            source: ['home.meishichina.com/recipe-type-do-technics-view-26.html'],
            target: '/recipe/recipe-type-do-technics-view-26',
        },
        {
            title: '按主要工艺 - 生鲜',
            source: ['home.meishichina.com/recipe-type-do-technics-view-27.html'],
            target: '/recipe/recipe-type-do-technics-view-27',
        },
        {
            title: '按主要工艺 - 调味',
            source: ['home.meishichina.com/recipe-type-do-technics-view-28.html'],
            target: '/recipe/recipe-type-do-technics-view-28',
        },
        {
            title: '按主要工艺 - 技巧',
            source: ['home.meishichina.com/recipe-type-do-technics-view-29.html'],
            target: '/recipe/recipe-type-do-technics-view-29',
        },
        {
            title: '按主要工艺 - 烙',
            source: ['home.meishichina.com/recipe-type-do-technics-view-31.html'],
            target: '/recipe/recipe-type-do-technics-view-31',
        },
        {
            title: '按主要工艺 - 榨汁',
            source: ['home.meishichina.com/recipe-type-do-technics-view-32.html'],
            target: '/recipe/recipe-type-do-technics-view-32',
        },
        {
            title: '按主要工艺 - 冷冻',
            source: ['home.meishichina.com/recipe-type-do-technics-view-33.html'],
            target: '/recipe/recipe-type-do-technics-view-33',
        },
        {
            title: '按主要工艺 - 焗',
            source: ['home.meishichina.com/recipe-type-do-technics-view-34.html'],
            target: '/recipe/recipe-type-do-technics-view-34',
        },
        {
            title: '按主要工艺 - 焯',
            source: ['home.meishichina.com/recipe-type-do-technics-view-35.html'],
            target: '/recipe/recipe-type-do-technics-view-35',
        },
        {
            title: '按主要工艺 - 干煸',
            source: ['home.meishichina.com/recipe-type-do-technics-view-36.html'],
            target: '/recipe/recipe-type-do-technics-view-36',
        },
        {
            title: '按主要工艺 - 干锅',
            source: ['home.meishichina.com/recipe-type-do-technics-view-37.html'],
            target: '/recipe/recipe-type-do-technics-view-37',
        },
        {
            title: '按主要工艺 - 铁板',
            source: ['home.meishichina.com/recipe-type-do-technics-view-38.html'],
            target: '/recipe/recipe-type-do-technics-view-38',
        },
        {
            title: '按主要工艺 - 微波',
            source: ['home.meishichina.com/recipe-type-do-technics-view-39.html'],
            target: '/recipe/recipe-type-do-technics-view-39',
        },
        {
            title: '按主要工艺 - 其他',
            source: ['home.meishichina.com/recipe-type-do-technics-view-50.html'],
            target: '/recipe/recipe-type-do-technics-view-50',
        },
    ],
};
