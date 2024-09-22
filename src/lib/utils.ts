import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import mime from 'mime';
import axios from "axios";
import { v4 } from "uuid";

export const DOCX_FILE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const PDF_FILE = "application/pdf";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToAscii(inputString: string) {
  // remove non ascii characters
  const asciiString = inputString.replace(/[^\x00-\x7F]+/g, "");
  return asciiString;
}

export function getFileMetadata(fileName: string) {
  const fileType = mime.getType(fileName);
  const fileExtension = fileType ? mime.getExtension(fileType) : null;

  return { fileType, fileExtension };
}

export async function fetchFileBytes(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
}

export async function getUploadUrl(fileKey: string) {
  const { data: uploadUrlResponse } = await axios.get(`/api/file/get-upload-url?fileName=${fileKey}`);
  const { url } = uploadUrlResponse;
  return url;
}

export async function uploadFileToS3(file: File, onProgress: (e: number) => any, onAbort: (upload: AbortController) => any) {
  try {
    const { fileType, fileExtension } = getFileMetadata(file.name);
    const fileKey = `uploads/${v4()}.${fileExtension}`;
    const url = await getUploadUrl(fileKey);

    const controller = new AbortController();
    if (onAbort) {
      onAbort(controller);
    }

    let formData = new FormData();
    formData.append('file', file);
    const response = await axios.put(url, formData, {
      signal: controller.signal,
      headers: {
        'Content-Type': fileType
      },
      onUploadProgress(progressEvent) {
        console.log('uploading to s3...', parseInt(((progressEvent.loaded! * 100) / progressEvent.total!).toString())) + '%'
        const percentCompleted = Math.round((progressEvent.loaded! * 100) / progressEvent.total!);
        if (onProgress) {
          onProgress(percentCompleted);
        }
      }
    })

    const ETag = response.headers['etag'];
    return Promise.resolve({
      fileKey: fileKey,
      fileName: file.name,
      checksum: ETag?.replace(/"/g, "") ?? ''
    });
  } catch (error: any) {
    console.log({ error })
    Promise.reject(new Error(error.message))
  }
}
