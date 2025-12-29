import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DocumentItem = {
    title?: string;
    description?: string;
    thumb?: string;
};

type AttachmentItem = {
    src?: string;
    name?: string;
    size?: string | number;
};

type DescriptionData = {
    images?: DescriptionImage[];
    title?: string;
    origin?: string;
    tags?: string[];
    license?: string;
    pubDate?: string;
    upDated?: string;
    intro?: string;
    description?: string;
    documents?: DocumentItem[];
    boms?: unknown[];
    attachments?: AttachmentItem[];
};

const escapeHTML = (input: unknown) => {
    if (input === undefined) {
        return '';
    }
    const str = String(input);
    const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return str.replaceAll(/[&<>"']/g, (char) => escapeMap[char] || char);
};

const formatObject = (obj: unknown) => {
    if (typeof obj !== 'object' || obj === null) {
        return escapeHTML(obj);
    }

    let result = '';
    for (const key in obj as Record<string, unknown>) {
        if (Object.hasOwn(obj, key)) {
            const value = (obj as Record<string, unknown>)[key];
            if (value !== null && value !== '') {
                result += `<div><strong>${escapeHTML(key)}:</strong> ${escapeHTML(value)}</div>`;
            }
        }
    }

    return result || '<em>无数据</em>';
};

const OshwhubDescription = ({ images, title, origin, tags, license, pubDate, upDated, intro, description, documents, boms, attachments }: DescriptionData) => {
    const headers = Array.isArray(boms) ? (boms[0] as unknown[] | undefined) : undefined;
    const rows = Array.isArray(boms) ? boms.slice(1) : [];

    return (
        <>
            {images?.map((image) =>
                image?.src ? (
                    <figure>
                        <img src={image.src} alt={image.alt} />
                    </figure>
                ) : null
            )}
            {title || origin || tags || license || pubDate || upDated || intro ? (
                <table>
                    <tbody>
                        {title ? (
                            <tr>
                                <th>名称</th>
                                <td>{title}</td>
                            </tr>
                        ) : null}
                        {origin ? (
                            <tr>
                                <th>版本</th>
                                <td>{origin}</td>
                            </tr>
                        ) : null}
                        {tags?.length ? (
                            <tr>
                                <th>标签</th>
                                <td>{tags.join(' / ')}</td>
                            </tr>
                        ) : null}
                        {license ? (
                            <tr>
                                <th>开源协议</th>
                                <td>{license}</td>
                            </tr>
                        ) : null}
                        {pubDate ? (
                            <tr>
                                <th>创建时间</th>
                                <td>{pubDate}</td>
                            </tr>
                        ) : null}
                        {upDated ? (
                            <tr>
                                <th>更新时间</th>
                                <td>{upDated}</td>
                            </tr>
                        ) : null}
                        {intro ? (
                            <tr>
                                <th>简介</th>
                                <td>{intro}</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            ) : null}
            {description ? (
                <>
                    <h2>描述</h2>
                    {raw(description)}
                </>
            ) : null}
            {documents?.length ? (
                <>
                    <h2>设计图</h2>
                    <div>
                        <ul>
                            {documents.map((document) => (
                                <li>
                                    {document.title ? <h4>{document.title}</h4> : null}
                                    {document.description ? <p>{document.description}</p> : null}
                                    {document.thumb ? (
                                        <figure>
                                            <img src={document.thumb} alt={document.title} />
                                        </figure>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : null}
            {Array.isArray(boms) ? (
                <>
                    <h2>BOM</h2>
                    <table>
                        <thead>
                            <tr>
                                {(headers ?? []).map((header) => (
                                    <th>{String(header)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr>{(Array.isArray(row) ? row : []).map((td, index, rowValues) => (index === rowValues.length - 1 ? <td>{raw(formatObject(td))}</td> : <td>{td}</td>))}</tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : null}
            {attachments?.length ? (
                <>
                    <h2>附件</h2>
                    <table>
                        <thead>
                            <th>序号</th>
                            <th>文件名称</th>
                            <th>文件大小</th>
                        </thead>
                        <tbody>
                            {attachments.map((attachment, index) => (
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{attachment.src ? <a href={`https://image.lceda.cn${attachment.src}`}>{attachment.name || '下载链接'}</a> : attachment.name || '无文件链接'}</td>
                                    <td>{attachment.size}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : null}
        </>
    );
};

export const renderDescription = (data: DescriptionData) => renderToString(<OshwhubDescription {...data} />);
