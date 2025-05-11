import { openai } from "./openai"

export const getEmbeddings = async (text: string) => {
    try {
        const response = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: text.replace(/\n/g, '')
        })

        const result = await response.json()
        console.log(result)
        return result.data[0].embedding as number[]
    } catch (err) { 
        console.log('embedding::err',err)
        throw err
    } 
}