const parseVid = (vid) => {
    let type, linkVid;
    if (vid.startsWith('av')) {
        type = 'aid';
        linkVid = vid;
        vid = vid.replace('av', '');
    } else if (vid !== '' && !isNaN(vid)) {
        type = 'aid';
        linkVid = `av${vid}`;
    } else if (vid.startsWith('BV')) {
        type = 'bvid';
        linkVid = vid;
    } else {
        type = 'bvid';
        vid = `BV${vid}`;
        linkVid = vid;
    }

    return { type, vid, linkVid };
};

const iframe = (aid, page) => {
    const { type, vid } = parseVid(aid);
    const iframeSrc = `https://player.bilibili.com/player.html?${type === 'aid' ? 'aid=' : 'bvid='}${vid}${page ? `&page=${page}` : ''}`;
    return `<iframe src="${iframeSrc}" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
};

module.exports = {
    iframe,
    parseVid,
};
