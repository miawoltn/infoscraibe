// import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server';
import { db, deductCredits, deleteChatById, deleteSingleChat, deleteUserChats, getChatById, getChatsByUserId, hasEnoughCredits, updateChatById } from '@/lib/db';
import { getContext } from '@/lib/context';
import { openai } from '@/lib/openai';
import { messages as msgs } from '@/lib/db/schema';
import { getFileHeadFromS3 } from '@/lib/s3';
import { calculateMessageCost } from '../../../lib/utils';
import { protectRoute } from '../../../lib/auth/utils';

// export const runtime = 'edge';
// export const dynamic = "force-dynamic"
export const maxDuration = 30;

const formatMessages = (messages: Message[]) => {
    return messages.map((msg: any) => {
        if (msg.role === 'system' && msg.feedback) {
            return {
                ...msg,
                content: `${msg.content}\n[Previous response was marked as ${msg.feedback} ${msg.feedbackReason ? `: ${msg.feedbackReason}` : ''
                    }]`
            };
        }
        return msg;
    });
};

export const POST = protectRoute(async (req: Request, user) => {
    const userId = user?.id!;
    try {
        const { messages, chatId } = await req.json();

        const chat = await getChatById(chatId);
        if (!chat) return NextResponse.json('chat not found', { status: 404 });


        // Estimate token usage (can be refined based on your needs)
        const estimatedTokens = messages.reduce((acc: number, msg: { content: string | any[]; }) =>
            acc + msg.content.length / 4, 0);
        const estimatedCost = calculateMessageCost(estimatedTokens);

        // Check if user has enough credits
        if (!(await hasEnoughCredits(userId, estimatedCost))) {
            return NextResponse.json(`Insufficient credits. Additional ${estimatedCost} units is required.`, { status: 402 });
        }

        const fileKey = chat.fileKey;
        const lastMessage: Message = messages[messages.length - 1];
        const context = await getContext(lastMessage.content, fileKey);
        const prompt = {
            role: "system",
            content: `Analyze the content of a provided file which may be a document (pdf, docx), image, video, or audio, and answer specific questions based on this content.
                    # Steps

                    1. **File Identification**: Determine the type of file provided (document, image, video, or audio).
                    2. **Content Extraction**:
                    - For documents, extract text content and any relevant metadata.
                    - For images, identify key objects or text present within the image.
                    - For videos, extract significant scenes, dialogues, or items of interest.
                    - For audio, transcribe spoken words and identify distinct sounds or background noises.
                    3. **Content Analysis**:
                    - Analyze the extracted content to identify key themes, facts, and details.
                    - Compare and contrast different elements within the content if applicable.
                    4. **Question Answering**: Use the analyzed information to answer any provided questions accurately. Justify your responses with specific examples or evidence from the file content.

                    # Output Format

                    Provide answers in a clear, concise, and structured manner. Use full sentences and appropriately cite portions of the extracted content when answering questions. The format can be in a paragraph or bullet-point list, as required by the questions.

                    # Examples

                    **Example 1**:
                    - **Input**: A pdf document containing a news article.
                    - **Questions**: What is the main topic of the article? Who wrote the article?
                    - **Output**:
                    - Main Topic: The article discusses [placeholder for main topic].
                    - Author: The article was written by [Author Name].

                    **Example 2**:
                    - **Input**: An image of a historical landmark.
                    - **Questions**: What landmark is shown in the image? What is the significance of this landmark?
                    - **Output**:
                    - Landmark: The image depicts [Landmark Name].
                    - Significance: [Landmark Name] is significant because [reason or historical context].

                    **Example 3**:
                    - **Input**: An audio recording of a speech.
                    - **Questions**: Who is speaking? What is the primary message of the speech?
                    - **Output**:
                    - Speaker: The speaker is [Speaker Name].
                    - Primary Message: The main message conveyed is [Summary of Speech].

                    # Notes

                    - Ensure that the extraction methods are appropriate for the file type.
                    - Be mindful of context and nuances, especially for media types like videos and audio.
                     START CONTEXT BLOCK
                        ${context}
                     END OF CONTEXT BLOCK
            `,
        };
        const formattedMessages = formatMessages([prompt, ...messages]);
        const response = await openai.createChatCompletion({
            model: 'gpt-4o',
            messages: formattedMessages, // include all messages for pro user
            stream: true,
            top_p: 1,
            
        });

        let actualTokenCount = 0;
        const stream = OpenAIStream(response, {
            onToken: () => {
                actualTokenCount++;
            },
            onCompletion: async (completion: string) => {
                await db.insert(msgs).values({ chatId, content: lastMessage.content, role: 'user' });
                await db.insert(msgs).values({ chatId, content: completion, role: 'system' })
                const actualCost = calculateMessageCost(actualTokenCount);
                await deductCredits(userId, actualCost, 'chat', {
                    chatId,
                    tokenCount: actualTokenCount
                });
            },
            onFinal(completion) {
                console.log('Final completion:', completion);
            },
        });
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
})

export const GET = protectRoute(async (req: Request, user) => {
      const userId = user?.id!;
    if (!userId) {
        return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
    }

    const chats = await getChatsByUserId(userId);
    chats.forEach(async (chat) => {
        if (!chat.checksum) {
            const { messages, checksum, ...rest } = chat
            chat.checksum = (await getFileHeadFromS3(chat.fileKey)).ETag?.replace(/"/g, "") ?? ''
            await updateChatById(chat.id, { checksum: chat.checksum, ...rest })
        }

    })
    return NextResponse.json(chats);
})

export const DELETE = protectRoute(async (request: Request, user) => {
    try {
      const userId = user?.id!;
      const { chatId } = await request.json().catch(() => ({}));
  
      if (chatId) {
        // Delete single chat
        await deleteSingleChat(chatId, userId);
        return NextResponse.json({
          message: 'Chat deleted successfully'
        });
      } else {
        // Delete all chats
        console.log('deleting all chats for user:', userId);
        const deletedCount = await deleteUserChats(userId);
        return NextResponse.json({
          message: `${deletedCount} chats deleted successfully`
        });
      }
    } catch (error) {
      console.error('Chat deletion error:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete chat(s)';
      return NextResponse.json(
        { error: message },
        { status: error instanceof Error && error.message.includes('unauthorized') ? 403 : 500 }
      );
    }
  });

// export const DELETE = protectRoute(async (request: Request) => {
//     try {
//         const { chatId } = await request.json();

//         if (!chatId) {
//             return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
//         }

//         deleteChatById(chatId);

//         return NextResponse.json(
//             { message: 'Chat scheduled for delete' },
//             { status: 200 }
//         )
//     } catch (err) {
//         console.error(err)
//         return NextResponse.json(
//             { error: "internal server error" },
//             { status: 500 }
//         )
//     }
// })