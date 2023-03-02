const extractDoc = (data) => {
    if (data.docData.contentData.contentList) {
        return extractContent(data.docData.contentData.contentList);
    }
    if (data.docData.contentData.image) {
        return data.docData.contentData.image.map((item) => `<p><img src="${item.url}"><br>${item.description.replace(/\n/g, '<br>')}</p>`).join('');
    }
};

const extractContent = (data) =>
    (data || [])
        .map((item) => {
            const type = item.type;
            if (type === 'video') {
                return `<video src="${item.data.mobileUrl}" controls style="width:100%;height:100%"></video>`;
            }
            if (type === 'text') {
                let temp = item.data;
                temp = temp.replace(/data-lazyload=(.+?) src=(.+?) style=".+?"/g, 'src=$1');
                return temp;
            }
            return '';
        })
        .join('<br>');

module.exports = {
    extractDoc,
};
