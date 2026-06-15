import { pipeline } from "@xenova/transformers";

let extractorPromise;

export async function generateVector(text)
{
    if (!extractorPromise)
        extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const extractor = await extractorPromise;
    const feature = await extractor(text, {pooling: 'mean', normalize: true});
    return Array.from(feature.data);
}
//Cosine Similarity
export function cosineSimilarity(Q, T)
{
    if (!Array.isArray(Q) || !Array.isArray(T) || Q.length === 0 || Q.length !== T.length)
        return 0;

    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;
    for(let i=0; i<Q.length; i++)
    {
        dot += Q[i] * T[i];
        mag1 += Q[i] * Q[i];
        mag2 += T[i] * T[i];
    }
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    if(mag1 == 0 || mag2 == 0)
        return 0;
    return dot / (mag1 * mag2);
}
