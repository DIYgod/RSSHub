import workerFactory from './utils';

export default workerFactory(
    () => ({
        title: '上海交通大学电子信息与电气工程学院本科教务办 -- 学术动态',
        local: 'seiee/list/683-1-20.htm',
        author: '上海交通大学电子信息与电气工程学院本科教务办',
    }),
    ($) =>
        $('.list_style_1 li')
            .toArray()
            .map((e) => ({
                date: $(e).children('span').text(),
                title: $(e).children('a').attr('title'),
                link: $(e).children('a').attr('href'),
            }))
);
