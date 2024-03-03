export default {
    'dol.go.th': {
        _name: 'กรมที่ดิน (Thaland Department of Lands)',
        announce: [
            {
                title: 'ประกาศกรมที่ดิน',
                docs: 'https://docs.rsshub.app/routes/government#thailand-department-of-lands-e-landsannouncement',
                source: '/index.php',
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
                },
            },
        ],
    },
};
