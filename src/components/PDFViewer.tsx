"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
  Scroll,
  FileX,
  X,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "simplebar-react/dist/simplebar.min.css";
import { useToast } from "./ui/use-toast";

import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import React, { useState } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn, DOCX_FILE, getFileMetadata, PDF_FILE } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import SimpleBar from "simplebar-react";
import PdfFullscreen from "./PdfFullScreen";

import Markdown from "markdown-to-jsx";
import { Skeleton } from "./ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFViewerProps {
  url: string;
  showPDF?: boolean;
  onClose?: () => void; // Add these props
}

const PDFViewer = ({ url, onClose, showPDF }: PDFViewerProps) => {
  const { toast } = useToast();

  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const [scroll, setScroll] = useState<boolean>(false);
  const [fileInput, setFileInput] = useState<any>(url);

  const isLoading = renderedScale !== scale;

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const { width, ref } = useResizeDetector();

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

  const { fileType } = getFileMetadata(url.split("?")[0]);

  return (
    <div className="w-full h-full bg-white dark:bg-transparent rounded-md shadow flex flex-col">
      {fileType === PDF_FILE ? (
        <>
          {/* Controls Header */}
          <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
            {/* Close button - Only visible on mobile */}
            <button
              onClick={onClose} // You'll need to lift this state up
              className="md:hidden absolute right-2 top-2 z-50 
                p-2 rounded-full bg-gray-100 hover:bg-gray-200 
                dark:bg-gray-800 dark:hover:bg-gray-700
                transition-colors duration-200"
              aria-label="Close PDF Viewer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Existing controls */}
            <div className="flex items-center gap-1">
              <Button
                disabled={currPage <= 1 || scroll}
                onClick={() => {
                  setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
                  setValue("page", String(currPage - 1));
                }}
                variant="ghost"
                aria-label="previous page"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1.5">
                <Input
                  disabled={scroll}
                  {...register("page")}
                  className={cn(
                    "w-12 h-8",
                    errors.page && "focus-visible:ring-red-500"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(handlePageSubmit)();
                    }
                  }}
                />
                <p className="text-zinc-700 text-sm space-x-1">
                  <span>/</span>
                  <span>{numPages ?? "x"}</span>
                </p>
              </div>
              <Button
                disabled={
                  numPages === undefined || currPage === numPages || scroll
                }
                onClick={() => {
                  setCurrPage((prev) =>
                    prev + 1 > numPages! ? numPages! : prev + 1
                  );
                  setValue("page", String(currPage + 1));
                }}
                variant="ghost"
                aria-label="next page"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>

              <Button
                onClick={() => setScroll((prev) => !prev)}
                variant={scroll ? "default" : "ghost"}
                aria-label="scroll"
              >
                <Scroll className="h-4 w-3" />
              </Button>
            </div>

            {/* <div className="flex items-center space-x-2"> */}
              {/* <div className='flex flex-row sm:flex-row space-x-1 items-center justify-end overflow-x-auto md:overflow-x-hidden md:space-x-0 md:grid-cols-12 md:gap-1 md:grid'> */}
              <div className="flex flex-row sm:flex-row overflow-x-scroll md:overflow-x-scroll space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="gap-1.5"
                      aria-label="zoom"
                      variant="ghost"
                    >
                      <Search className="h-4 w-4" />
                      {scale * 100}%
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setScale(1)}>
                      100%
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setScale(1.5)}>
                      150%
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setScale(2)}>
                      200%
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setScale(2.5)}>
                      250%
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={() => setRotation((prev) => prev + 90)}
                  variant="ghost"
                  aria-label="rotate 90 degrees"
                >
                  <RotateCw className="h-4 w-3" />
                </Button>

                <PdfFullscreen fileUrl={fileInput} />
              </div>
            {/* </div> */}
          </div>

          {/* PDF Content */}
          <div className="flex-1 overflow-hidden h-[calc(100%-3.5rem)]">
            <SimpleBar autoHide={true} className="h-full">
              <div ref={ref}>
                <Document
                  loading={
                    <div className="flex justify-center p-8">
                      <Skeleton className="h-[60vh] w-full" />
                    </div>
                  }
                  onLoadError={() => {
                    toast({
                      title: "Error loading PDF",
                      description: "Please try again later",
                      variant: "destructive",
                    });
                  }}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  file={fileInput}
                  className="max-h-full"
                >
                  <div className="no-scrollbar overflow-y-auto overflow-x-auto">
                    {scroll && numPages ? (
                      Array.from({ length: numPages }, (_, index) => (
                        <Page
                          key={index + 1}
                          width={width ? width : 1}
                          pageNumber={index + 1}
                          scale={scale}
                          rotate={rotation}
                        />
                      ))
                    ) : (
                      <Page
                        width={width ? width : 1}
                        pageNumber={currPage}
                        scale={scale}
                        rotate={rotation}
                        loading={
                          <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        }
                        onRenderSuccess={() => setRenderedScale(scale)}
                      />
                    )}
                  </div>
                </Document>
              </div>
            </SimpleBar>
          </div>
        </>
      ) : fileType === DOCX_FILE ? (
        // Word document viewer
        <div className="w-full h-full relative">
          <button
            onClick={onClose}
            className="md:hidden absolute right-2 top-2 z-50 
              p-2 rounded-full bg-gray-100 hover:bg-gray-200 
              dark:bg-gray-800 dark:hover:bg-gray-700
              transition-colors duration-200"
            aria-label="Close Document Viewer"
          >
            <X className="h-4 w-4" />
          </button>
          <iframe
            title="doc-iframe"
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              url
            )}`}
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full p-8 relative">
          <button
            onClick={onClose}
            className="md:hidden absolute right-2 top-2 z-50 
              p-2 rounded-full bg-gray-100 hover:bg-gray-200 
              dark:bg-gray-800 dark:hover:bg-gray-700
              transition-colors duration-200"
            aria-label="Close Document Viewer"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-center">
            <FileX className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Unable to render document
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This file format is not supported
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
