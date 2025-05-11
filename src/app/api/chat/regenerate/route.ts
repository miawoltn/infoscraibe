import { Message, OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';
import { getChatById, getMessageById, updateMessageWithVersionAndLabel } from '@/lib/db';
import { getContext } from '@/lib/context';
import { openai } from '@/lib/openai';
import { generateVersionLabel } from '../../../../lib/utils';
import { protectRoute } from '../../../../lib/auth/utils';

export const POST = protectRoute(async (req: Request) => {
    try {
        const { messages, chatId, messageId, previousUserMessageId } = await req.json();

        const message = await getMessageById(messageId);
        
        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }
        
        // Check regeneration count
        if (message.regenerationCount >= 3) {
            return NextResponse.json({ 
                error: 'Maximum regenerations reached (3 versions)',
                regenerationCount: message.regenerationCount,
                previousVersions: message.previousVersions
            }, { status: 400 });
        }

        const chat = await getChatById(chatId);
        if (!chat) return NextResponse.json({ 'error': 'chat not found' }, { status: 404 });
        const fileKey = chat.fileKey;

        const previousUserMessage = messages.find((m: Message) => m.id === previousUserMessageId);
        if (!previousUserMessage) {
            return NextResponse.json({ error: 'Previous user message not found' }, { status: 400 });
        }

        const context = await getContext(previousUserMessage.content, fileKey);
        
        const prompt = {
            role: "system",
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            AI assistant is a big fan of Pinecone and Vercel.
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
            AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `,
        };

        const response = await openai.createChatCompletion({
            model: 'gpt-4-turbo',
            messages: [
                prompt,
                ...messages.slice(0, -1),
                {
                    role: 'system',
                    content: 'Compare this response to the previous one and provide a brief label describing how it differs (e.g., "More detailed", "Simplified", "Technical focus")'
                }
            ],
            stream: true
        });

        const stream = OpenAIStream(response, {
            onCompletion: async (completion: string) => {
                try {
                    const label = await generateVersionLabel(completion, message.content);
                    console.log('Generated label:', label);
                    const updatedMessage = await updateMessageWithVersionAndLabel(messageId, completion, label);
                    console.log('Updated message:', updatedMessage);
                    completion = JSON.stringify({ content: completion, label });
                    console.log({completion})
                } catch (error) {
                    console.error('Error updating message with label:', error);
                }
            }
        });

        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
})