
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3';
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter'
import { getEmbeddings } from './embeddings';
import md5 from 'md5';
import { convertToAscii } from './utils';
import mime from 'mime';


type PDFPage = {
    pageContent: string,
    metadata: {
        loc: { pageNumber: number }
    }
}

let pinecone: Pinecone | null = null;

const extensions = {PDF: 'pdf', WORD: 'docx' }

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

export async function loadS3IntoPinecone(fileKey: string, fileType: string) {
    try {
        // get file pdf from s3
        const pdfBase64 = await downloadFromS3(fileKey);
        const extension = mime.getExtension(fileType) ?? '';

        // load the pdf
        const blob = new Blob([Buffer.from(pdfBase64!!, 'base64')]);
        // const pdfReader = new WebPDFLoader(blob);
        const pdfReader = getDocumentLoader(extension, blob);
        const pages = await pdfReader.load() as PDFPage[];

        // console.dir({pages}, { depth: null })

        // split and segment document
        const docs = await Promise.all(pages.map((page, index) => {
            if(!(page.metadata.loc?.pageNumber)) page.metadata = { loc: { pageNumber: index+1 }};
            console.log(page.metadata)
            return prepareDocument(page)
        }))

        // console.dir({docs}, { depth: null })
        // vectorise
        const vectors = await Promise.all(docs.flat().map(embedDocument)) as PineconeRecord[]

        // console.log({vectors})

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
                pageNumber: doc.metadata.pageNumber,
                text: doc.metadata.text
            }
        } as PineconeRecord
    } catch (error) {
        
    }
}

const prepareDocument = async (page: PDFPage) => {
    // console.dir(page.metadata)
    let { pageContent, metadata } = page
    pageContent = pageContent.replace(/\n/g, '')
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500, // reduce chunkSize from 1000 to 500
        chunkOverlap: 200,
    })
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent, 
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: pageContent //truncateStringByBytes(pageContent, 36000)
            }
        })
    ])

    return docs
}

function truncateStringByBytes(pageContent: string, bytes: number) {
    const encoder = new TextEncoder()
    return new TextDecoder().decode(encoder.encode(pageContent).slice(0, bytes))
}

function getDocumentLoader(extension: string, blob: Blob) {
    if(extensions.PDF == extension) {
        return new WebPDFLoader(blob);
    } 

    if(extensions.WORD == extension) {
        return new DocxLoader(blob)
    }

    throw Error('Unsupported extension');
}
