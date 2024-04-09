jest.mock('request-promise-native');
const RSSHub = require('../lib/pkg');

describe('pkg', () => {
    it('config', () => {
        RSSHub.init({
            UA: 'mock',
        });
        const config = require('../lib/config').value;
        expect(config.ua).toBe('mock');
    });

    it('request', (done) => {
        RSSHub.request('/test/1').then((data) => {
            expect(data).toMatchObject({
                atomlink: 'http:///test/1',
                title: 'Test 1',
                itunes_author: null,
                link: 'https://github.com/DIYgod/RSSHub',
                item: [
                    {
                        title: 'Title1',
                        description: 'Description1',
                        pubDate: 'Mon, 31 Dec 2018 15:59:50 GMT',
                        link: 'https://github.com/DIYgod/RSSHub/issues/1',
                        author: 'DIYgod1',
                    },
                    {
                        title: 'Title2',
                        description: 'Description2',
                        pubDate: 'Mon, 31 Dec 2018 15:59:40 GMT',
                        link: 'https://github.com/DIYgod/RSSHub/issues/2',
                        author: 'DIYgod2',
                    },
                    {
                        title: 'Title3',
                        description: 'Description3',
                        pubDate: 'Mon, 31 Dec 2018 15:59:30 GMT',
                        link: 'https://github.com/DIYgod/RSSHub/issues/3',
                        author: 'DIYgod3',
                    },
                    {
                        title: 'Title4',
                        description: 'Description4',
                        pubDate: 'Mon, 31 Dec 2018 15:59:20 GMT',
                        link: 'https://github.com/DIYgod/RSSHub/issues/4',
                        author: 'DIYgod4',
                    },
                    {
                        title: 'Title5',
                        description: 'Description5',
                        pubDate: 'Mon, 31 Dec 2018 15:59:10 GMT',
                        link: 'https://github.com/DIYgod/RSSHub/issues/5',
                        author: 'DIYgod5',
                    },
                ],
                allowEmpty: false,
            });
            done();
        });
    });

    it('error', (done) => {
        RSSHub.request('/test/error')
            .then(() => {
                done();
            })
            .catch((e) => {
                expect(e).toBe('Error test');
                done();
            });
    });
});
