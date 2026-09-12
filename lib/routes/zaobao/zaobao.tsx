import { raw } from 'hono/html';

import type { ImageData } from './util';

function zaobao({ imageDataArray, articleBody }) {
    return (
        <>
            {imageDataArray.map((imageData: ImageData) =>
                imageData.type === 'normalHTML' ? (
                    <div>{raw(imageData.html)}</div>
                ) : (
                    imageData.type === 'data' && (
                        <figure>
                            <img src={imageData.src} />
                            <figcaption>{imageData.title}</figcaption>
                        </figure>
                    )
                )
            )}
            {articleBody && <div>{raw(articleBody)}</div>}
        </>
    );
}

export default zaobao;
