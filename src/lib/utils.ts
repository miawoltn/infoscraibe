import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import mime from 'mime';

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
