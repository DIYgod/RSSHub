import { ImageData } from './util';

function zaobao({ imageDataArray, articleBody }) {
    return (
        <>
            {imageDataArray.map((imageData: ImageData) =>
                imageData.type === 'normalHTML' ? (
                    <div dangerouslySetInnerHTML={{ __html: imageData.html }} />
                ) : (
                    imageData.type === 'data' && (
                        <figure>
                            <img src={imageData.src} />
                            <figcaption>{imageData.title}</figcaption>
                        </figure>
                    )
                )
            )}
            {articleBody && <div dangerouslySetInnerHTML={{ __html: articleBody }} />}
        </>
    );
}

export default zaobao;
