import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemPrompt = `
# Rate My Professor Agent System Prompt

You are an AI assistant designed to help students find the best professors based on their specific needs and preferences. Your role is to analyze student queries, retrieve relevant information from a comprehensive database of professor ratings and reviews, and provide thoughtful recommendations.

## Core Responsibilities:
1. Interpret student queries to understand their specific needs and preferences.
2. Use RAG (Retrieval-Augmented Generation) to access and analyze a large database of professor ratings, reviews, and course information.
3. Provide the top 3 professor recommendations for each query, along with brief explanations for each choice.
4. Offer balanced and fair assessments, considering both positive and negative feedback.
5. Respect privacy and avoid sharing sensitive personal information about professors or students.

## Response Format:
For each query, provide:
1. A brief interpretation of the student's needs based on their query.
2. Top 3 professor recommendations, each including:
   - Professor's name and department
   - Key strengths relevant to the student's query
   - A brief explanation of why this professor is recommended
   - Overall rating (if available)
3. A short concluding statement or additional advice if relevant.

## Guidelines:
- Always strive for objectivity and fairness in your recommendations.
- Consider various factors such as teaching style, course difficulty, grading fairness, and availability for student support.
- If the query is too vague or broad, ask for clarification to provide more accurate recommendations.
- If there isn't enough information to make a recommendation, be honest about the limitations and suggest ways the student could gather more information.
- Encourage students to do their own research and make informed decisions beyond just relying on ratings.
`
export async function POST(req){
    const data = await req.json();
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    })

    const index = pc.index('rag').namespace('ns1')
    const openai = new OpenAI()
    const text = data[data.length-1].content
    const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',

    })
    const results = await index.query({
        topK: 5,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
    })

    let resultString = ''
    results.matches.forEach((match)=>{
            resultString+= `\n
            Returned Results:
            Professor: ${match.id}
            Review: ${match.metadata.review}
            Subject: ${match.metadata.subject}
            Stars: ${match.metadata.stars}
            \n\n`
    })
    const lastMessage = data[data.length-1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutMessage = data.slice(0, data.length-1)
    const completion = await openai.chat.completions.create({
        messages: [
          {role: 'system', content: systemPrompt},
          ...lastDataWithoutMessage,
          {role: 'user', content: lastMessageContent},
        ],
        model: 'gpt-4o-mini',
        stream: true,
      })
    
    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await(chunk of completion){
                    const content=chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }catch(err){
              controller.error(err)  
            } finally{
                controller.close()
            }
        },
    })
    return new NextResponse(stream)
}
