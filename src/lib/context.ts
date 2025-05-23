import { getEmbeddings } from './embeddings';
import { embeddingIndex } from './pinecone';
import { convertToAscii } from './utils';

export async function getMatchesFromEmbedding(embeddings: number[], fileKey: string) {
   const index = await embeddingIndex();
   try {
    const namespace = index.namespace(convertToAscii(fileKey));
    const result = await namespace.query({
        topK: 5,
        vector: embeddings,
        includeMetadata: true,
    });

    return result.matches || [];
   } catch (error) {
    console.log('error querying embedding', error);
   }
}

export async function getContext(query: string, fileKey: string) {
    const queryEmbeddings = await getEmbeddings(query);
    const matches = await getMatchesFromEmbedding(queryEmbeddings, fileKey);

    const qualifyingDocs = matches?.filter(match => match.score && match.score > 0.7);
    
    type MetaData = {
        text: string,
        pageNumber: number
    }

    let docs = qualifyingDocs?.map(match => (match.metadata as MetaData));

    return docs?.map((doc) => `${doc.pageNumber}. ${doc.text}`).join('\n') //.substring(0, 3000);
}