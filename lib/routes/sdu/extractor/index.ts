import news from './wh/news';
import view from './view';
import sdrj from './sdrj';
import jwc from './wh/jwc';

const index = (link) => {
    if (link.startsWith('https://xinwen.wh.sdu.edu.cn/')) {
        return news(link);
    }
    if (link.startsWith('https://www.view.sdu.edu.cn/')) {
        return view(link);
    }
    if (link.startsWith('https://www.sdrj.sdu.edu.cn/')) {
        return sdrj(link);
    }
    if (link.startsWith('https://jwc.wh.sdu.edu.cn/')) {
        return jwc(link);
    }
    return {};
};
export default index;
