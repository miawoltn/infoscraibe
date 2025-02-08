
import { AbortMultipartUploadCommand, CompleteMultipartUploadCommandOutput, DeleteObjectCommand, GetObjectCommand, GetObjectCommandInput, HeadObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import toast from 'react-hot-toast';
import { v4 } from 'uuid';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from 'mime';

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
    },
    region: process.env.AWS_REGION
})

const bucketName = process.env.S3_BUCKET_NAME

const PART_SIZE = 5 * 1024 * 1024;

let currentUploadId: any = null;

export async function uploadToS3({ file, fileExtension }: { file: File, fileExtension: string }, onProgress: (e: number) => any, onAbort: (upload: Upload) => any) {
    const fileKey = `uploads/${v4()}.${fileExtension}`;
    try {
        const params = {
            Bucket: bucketName,
            Key: fileKey,
            Body: file,
        };

        const upload = new Upload({
            client,
            tags: [], // optional tags
            queueSize: 4, // optional concurrency configuration
            partSize: PART_SIZE, // optional size of each part
            leavePartsOnError: false, // optional manually handle dropped parts
            params: params,
        });

        if (onAbort) {
            onAbort(upload);
        }

        console.log('upload started')
        return await upload.on('httpUploadProgress', (progressEvent) => {
            console.log('uploading to s3...', parseInt(((progressEvent.loaded! * 100) / progressEvent.total!).toString())) + '%'
            const percentCompleted = Math.round((progressEvent.loaded! * 100) / progressEvent.total!);
            if (onProgress) {
                onProgress(percentCompleted);
            }
        })
            .done()
            .then((data: CompleteMultipartUploadCommandOutput) => {
                console.log('ETag', data.ETag)
                // return data;
                return Promise.resolve({
                    fileKey,
                    fileName: file.name,
                    checksum: data.ETag?.replace(/"/g, "") ?? ''
                })
            })
            .catch((error) => {
                console.log('first', error)
                return Promise.resolve(null)
            });



        // console.log('upload done')
        // return Promise.resolve({
        //     fileKey,
        //     fileName: file.name,
        // })
    } catch (error: any) {
        console.log({ error })
        Promise.reject(new Error(error.message))
    }
}

export async function downloadFromS3(file_key: string) {
    try {
        const input: GetObjectCommandInput = {
            Bucket: bucketName,
            Key: file_key
        };
        const command = new GetObjectCommand(input);
        const s3GetObjectResponse = await client.send(command);
        const base64Image = await s3GetObjectResponse.Body?.transformToString("base64");
        return base64Image;
    } catch (error) {
        Promise.reject(error)
    }
}

export async function abortMultipartUpload(fileKey: string, uploadId: string) {
    try {
        const abortMultipartUploadCommand = new AbortMultipartUploadCommand({
            Bucket: bucketName,
            Key: fileKey,
            UploadId: uploadId,
        });
        await client.send(abortMultipartUploadCommand);
        console.log(`Multipart upload with ID ${uploadId} has been aborted.`);
    } catch (error) {
        console.error('Error aborting multipart upload:', error);
    }
}

export function getS3Url(file_key: string) {
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${file_key}`;
    return url;
}

export async function getFileUrl(fileKey: string) {
  const urlCommand: GetObjectCommandInput = {
    Bucket: bucketName,
    Key: fileKey,
  };

  const command = new GetObjectCommand(urlCommand);

  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  return url;
}

export const deleteFileFromS3 = async (
    bucketKey: string,
) => {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: bucketKey,
    });

    try {
        const response = await client.send(command);
        console.log({ response });
    } catch (err) {
        console.error('S3 delete error: ', err);
    }
}

export async function getFileHeadFromS3 (bucketKey: string) {
    const input: GetObjectCommandInput = {
        Bucket: bucketName,
        Key: bucketKey
    };
    const command = new HeadObjectCommand(input);
    return await client.send(command);
}


export async function getUploadUrl(fileName: string) {
    const fileType = mime.getType(fileName) || '';
    console.log({fileType})
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        ContentType: fileType
    });

  return await getSignedUrl(client, command, { expiresIn: 60 });
}
