
import AWS from 'aws-sdk'
import {GetObjectCommand, GetObjectCommandInput, S3Client} from '@aws-sdk/client-s3'
import {Upload} from '@aws-sdk/lib-storage'

//   AWS.config.update({
//             accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
//             secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
//         })
// const s3 = new AWS.S3({
//     params: {
//         Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME
//     },
//     region: process.env.NEXT_PUBLIC_AWS_REGION
//         })

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY || ''
    },
    region: process.env.NEXT_PUBLIC_AWS_REGION
})

const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME

export async function uploadToS3(file:File, onProgress: (e: number)=> any) {
    try {
      
        const file_key = "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

        const params = {
            Bucket: bucketName,
            Key: file_key,
            Body: file,
          };
        // const upload = s3.putObject(params).on('httpUploadProgress', evt =>{
        //     console.log('uploading to s3...', parseInt(((evt.loaded * 100)/evt.total).toString())) + '%'
        //   }).promise();

    
        const upload = new Upload({
            client,
            params
        })
        // .done()
        // .then(data => {
        //     console.log('successfully uploaded to s3!', file_key)
        // })

        await upload.on('httpUploadProgress', (progressEvent) =>{
            console.log('uploading to s3...', parseInt(((progressEvent.loaded! * 100)/progressEvent.total!).toString())) + '%'
            const percentCompleted = Math.round((progressEvent.loaded! * 100) / progressEvent.total!);
            if (onProgress) {
                onProgress(percentCompleted);
            }
        }).done();

        //   await upload.then(data => {
        //     console.log('successfully uploaded to s3!', file_key)
        //   })


          return Promise.resolve({
            file_key, 
            file_name: file.name
          })
    } catch(error) {
        Promise.reject(error)
    }
}

export async function downloadFromS3(file_key: string) {
    try {
        const input: GetObjectCommandInput = {
            Bucket: bucketName,
            Key: file_key,
            ResponseContentEncoding: "base64",
            ResponseContentDisposition: "inline",
          };
          const command = new GetObjectCommand(input);
          const s3GetObjectResponse = await client.send(command);
          const base64Image = await s3GetObjectResponse.Body?.transformToString("base64");
          return base64Image;
    } catch(error) {
        Promise.reject(error)
    }
}

export function getS3Url(file_key: string) {
    const url = `https://${bucketName}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${file_key}`;
    return url;
}