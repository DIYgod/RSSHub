import {getContent} from '~/routes/xiaohongshu/util';

export default async (ctx) => {
    const url = `https://www.xiaohongshu.com/board/${ctx.params.board_id}`;
    const content = await getContent(url);
    const regex = /_SSR_STATE__\S*=([\s\S]+)<\/script>/gm;
    const match = regex.exec(content);
    const main = JSON.parse(match[1]).Main;

    const {
        albumInfo
    } = main;
    const title = albumInfo.name;
    const description = albumInfo.desc;

    const list = main.notesDetail;
    const resultItem = list.map((item) => ({
        title: item.title,
        link: `https://www.xiaohongshu.com/discovery/item/${item.id}`,
        description: `<img src ="${item.cover.url}"><br>${item.title}`,
    }));
    ctx.state.data = {
        title,
        link: url,
        item: resultItem,
        description,
    };
};
