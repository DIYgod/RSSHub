module.exports = {
    'parliament.go.th': {
        _name: 'รัฐสภา',
        www: [
            {
                title: 'รับฟังความคิดเห็นต่อร่าง พ.ร.บ. ตามมาตรา 77 ของรัฐธรรมนูญ',
                docs: 'https://docs.rsshub.app/routes/government#thailand-parliament-section77',
                /* source: '/index.php',
                target: (params, url, document) => {
                    const queryParams = new URL(url).searchParams;
                    let rssPath = '/dol/announce';
                    if (!queryParams.has('searchconcerned')) {
                        return rssPath;
                    }

                    rssPath += `/${encodeURIComponent(queryParams.get('searchconcerned'))}`;

                    const province = document && document.querySelector('#searchprovince').value !== '' ? document.querySelector(`#searchprovince option[value="${document.querySelector('#searchprovince').value}"]`).text() : '';

                    const office = document && document.querySelector('#searchoffice').value !== '' ? document.querySelector(`#searchoffice option[value="${document.querySelector('#searchoffice').value}"]`).text() : '';

                    if (!province || !office) {
                        return rssPath;
                    }

                    rssPath += `/${encodeURIComponent(province)}/${encodeURIComponent(office)}`;

                    return rssPath;
                },*/
            },
        ],
    },
};
