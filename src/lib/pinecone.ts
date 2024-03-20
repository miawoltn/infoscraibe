
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3';
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter'
import { getEmbeddings } from './embeddings';
import md5 from 'md5';
import { convertToAscii } from './utils';


type PDFPage = {
    pageContent: string,
    metadata: {
        loc: { pageNumber: number }
    }
}

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
    if (!pinecone) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY || '',
        })
    }

    return pinecone;
}

export const chatPdfIndex = async () => {
    return (await getPineconeClient()).index('chatpdf');
}

export async function loadS3IntoPinecone(fileKey: string) {
    try {
        // get file pdf from s3
        const pdfBase64 = await downloadFromS3(fileKey);

        // load the pdf
        const blob = new Blob([Buffer.from(pdfBase64!!, 'base64')]);
        const pdfReader = new WebPDFLoader(blob);
        const pages = await pdfReader.load() as PDFPage[];

        // split and segment document
        const docs = await Promise.all(pages.map(prepareDocument))

        // vectorise
        const vectors = await Promise.all(docs.flat().map(embedDocument)) as PineconeRecord[]

        // upload to pinecone
        const client = await getPineconeClient()
        const index = client.Index('chatpdf')
        const namespace = index.namespace(convertToAscii(fileKey))
        await namespace.upsert(vectors)

        return Promise.resolve(docs[0]);
    } catch (err) {
        return Promise.reject(err);
    }

}

const embedDocument = async (doc: Document) => {
    try {
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent)
        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        } as PineconeRecord
    } catch (error) {
        
    }
}

const prepareDocument = async (page: PDFPage) => {
    let { pageContent, metadata } = page
    pageContent = pageContent.replace(/\n/g, '')
    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent, 
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000)
            }
        })
    ])

    return docs
}

function truncateStringByBytes(pageContent: string, bytes: number) {
    const encoder = new TextEncoder()
    return new TextDecoder().decode(encoder.encode(pageContent).slice(0, bytes))
}
