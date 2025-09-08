import type { FC } from 'hono/jsx';

import { Layout } from '@/views/layout';
import { gitHash, gitDate } from '@/utils/git-hash';

const Index: FC<{
    requestPath: string;
    message: string;
    errorRoute: string;
    nodeVersion: string;
}> = ({ requestPath, message, errorRoute, nodeVersion }) => (
    <Layout>
        <div
            className="pointer-events-none absolute w-full min-h-screen"
            style={{
                backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMicgd2lkdGg9JzMyJyBoZWlnaHQ9JzMyJyBmaWxsPSdub25lJyBzdHJva2U9J3JnYigxNSAyMyA0MiAvIDAuMDQpJz48cGF0aCBkPSdNMCAuNUgzMS41VjMyJy8+PC9zdmc+')`,
                maskImage: 'linear-gradient(transparent, black, transparent)',
            }}
        ></div>
        <div className="w-full grow shrink-0 py-8 flex items-center justify-center flex-col space-y-4">
            <img className="grayscale" src="/logo.png" alt="RSSHub" width="100" loading="lazy" />
            <h1 className="text-4xl font-bold">Looks like something went wrong</h1>
            <div className="text-left w-[800px] space-y-6 !mt-10">
                <div className="space-y-2">
                    <p className="mb-2 font-bold">Helpful Information</p>
                    <p className="message">
                        Error Message:
                        <br />
                        <code className="mt-2 block max-h-28 overflow-auto bg-zinc-100 align-bottom w-fit details whitespace-pre-line">{message}</code>
                    </p>
                    <p className="message">
                        Route: <code className="ml-2 bg-zinc-100">{errorRoute}</code>
                    </p>
                    <p className="message">
                        Full Route: <code className="ml-2 bg-zinc-100">{requestPath}</code>
                    </p>
                    <p className="message">
                        Node Version: <code className="ml-2 bg-zinc-100">{nodeVersion}</code>
                    </p>
                    <p className="message">
                        Git Hash: <code className="ml-2 bg-zinc-100">{gitHash}</code>
                    </p>
                    <p className="message">
                        Git Date: <code className="ml-2 bg-zinc-100">{gitDate?.toUTCString()}</code>
                    </p>
                </div>
                <div>
                    <p className="mb-2 font-bold">Report</p>
                    <p>
                        After carefully reading the{' '}
                        <a className="text-[#F5712C]" href="https://docs.rsshub.app/" target="_blank">
                            document
                        </a>
                        , if you think this is a bug of RSSHub, please{' '}
                        <a className="text-[#F5712C]" href="https://github.com/DIYgod/RSSHub/issues/new?assignees=&labels=RSS+bug&template=bug_report_en.yml" target="_blank">
                            submit an issue
                        </a>{' '}
                        on GitHub.
                    </p>
                    <p>
                        在仔细阅读
                        <a className="text-[#F5712C]" href="https://docs.rsshub.app/zh/" target="_blank">
                            文档
                        </a>
                        后，如果你认为这是 RSSHub 的 bug，请在 GitHub{' '}
                        <a className="text-[#F5712C]" href="https://github.com/DIYgod/RSSHub/issues/new?assignees=&labels=RSS+bug&template=bug_report_zh.yml" target="_blank">
                            提交 issue
                        </a>
                        。
                    </p>
                </div>
                <div>
                    <p className="mb-2 font-bold">Community</p>
                    <p>
                        You can also join our{' '}
                        <a className="text-[#F5712C]" target="_blank" href="https://t.me/rsshub">
                            Telegram group
                        </a>
                        , or follow our{' '}
                        <a className="text-[#F5712C]" target="_blank" href="https://t.me/awesomeRSSHub">
                            Telegram channel
                        </a>{' '}
                        and{' '}
                        <a target="_blank" href="https://x.com/intent/follow?screen_name=_RSSHub" className="text-[#F5712C]">
                            Twitter
                        </a>{' '}
                        to get community support and news.
                    </p>
                    <p>
                        你也可以加入我们的{' '}
                        <a className="text-[#F5712C]" target="_blank" href="https://t.me/rsshub">
                            Telegram 群组
                        </a>
                        ，或关注我们的{' '}
                        <a className="text-[#F5712C]" target="_blank" href="https://t.me/awesomeRSSHub">
                            Telegram 频道
                        </a>
                        和{' '}
                        <a target="_blank" href="https://x.com/intent/follow?screen_name=_RSSHub" className="text-[#F5712C]">
                            Twitter
                        </a>{' '}
                        获取社区支持和新闻。
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-4 pb-8 text-center w-full text-sm font-medium space-y-2">
            <p className="space-x-4">
                <a target="_blank" href="https://github.com/DIYgod/RSSHub">
                    <img className="inline" src="https://icons.ly/github/_/fff" alt="github" width="20" height="20" />
                </a>
                <a target="_blank" href="https://t.me/rsshub">
                    <img className="inline" src="https://icons.ly/telegram" alt="telegram group" width="20" height="20" />
                </a>
                <a target="_blank" href="https://t.me/awesomeRSSHub">
                    <img className="inline" src="https://icons.ly/telegram" alt="telegram channel" width="20" height="20" />
                </a>
                <a target="_blank" href="https://x.com/intent/follow?screen_name=_RSSHub" className="text-[#F5712C]">
                    <img className="inline" src="https://icons.ly/x" alt="X" width="20" height="20" />
                </a>
            </p>
            <p className="!mt-6">
                Please consider{' '}
                <a target="_blank" href="https://docs.rsshub.app/sponsor" className="text-[#F5712C]">
                    sponsoring
                </a>{' '}
                to help keep this open source project alive.
            </p>
            <p>
                Made with ❤️ by{' '}
                <a target="_blank" href="https://diygod.cc" className="text-[#F5712C]">
                    DIYgod
                </a>{' '}
                and{' '}
                <a target="_blank" href="https://github.com/DIYgod/RSSHub/graphs/contributors" className="text-[#F5712C]">
                    Contributors
                </a>{' '}
                under MIT License.
            </p>
        </div>
    </Layout>
);

export default Index;
