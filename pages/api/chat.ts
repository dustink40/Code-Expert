import { type NextRequest, NextResponse } from 'next/server'
import { initialMessages } from '../../components/Chat'
import { type Message } from '../../components/ChatLine'

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

const botName = 'D.E.C.K.E.X.P.E.R.T.'
const userName = 'News reporter' // TODO: move to ENV var
const firstMessge = initialMessages[0].message

// @TODO: unit test this. good case for unit testing
const generatePromptFromMessages = (messages: Message[]) => {
  console.log('== INITIAL messages ==', messages)

  let prompt = ''

  // add first user message to prompt
  prompt += messages[1].message

  // remove first conversaiton (first 2 messages)
  const messagesWithoutFirstConvo = messages.slice(2)
  console.log(' == messagesWithoutFirstConvo', messagesWithoutFirstConvo)

  // early return if no messages
  if (messagesWithoutFirstConvo.length == 0) {
    return prompt
  }

  messagesWithoutFirstConvo.forEach((message: Message) => {
    const name = message.who === 'user' ? userName : botName
    prompt += `\n${name}: ${message.message}`
  })
  return prompt
}

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  // read body from request
  const body = await req.json()

  // const messages = req.body.messages
  const messagesPrompt = generatePromptFromMessages(body.messages)
  const defaultPrompt = `You are an AI programming assistant designed to help with writing and editing code. Your goal is to be an expert in various programming languages and assist users with their coding tasks. You have access to extensive knowledge about programming concepts, syntax, best practices, and common programming challenges.

  To get started, you can ask me questions or request help with specific coding tasks. For example, you can ask me to explain a programming concept, provide code examples, fix bugs in your code, optimize algorithms, or suggest improvements to your code.
  
  You can interact with me using natural language queries or code snippets. Feel free to experiment with different coding challenges and scenarios to enhance my understanding and expertise. As you provide feedback and corrections, I will learn and improve my responses over time.
  
  Please note that I may not have knowledge of specific libraries or frameworks that were released after my training data cutoff date. However, I will do my best to assist you with general programming principles and strategies.
  
  Let's start coding together!
   ${botName}: `
  const finalPrompt = process.env.AI_PROMPT
    ? `${process.env.AI_PROMPT}${messagesPrompt}\n${botName}: `
    : defaultPrompt

  const payload = {
    model: 'text-davinci-003',
    prompt: finalPrompt,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 200,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: [`${botName}:`, `${userName}:`],
    user: body?.user,
  }

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  }

  if (process.env.OPENAI_API_ORG) {
    requestHeaders['OpenAI-Organization'] = process.env.OPENAI_API_ORG
  }

  const response = await fetch('https://api.openai.com/v1/completions', {
    headers: requestHeaders,
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (data.error) {
    console.error('OpenAI API error: ', data.error)
    return NextResponse.json({
      text: `ERROR with API integration. ${data.error.message}`,
    })
  }

  // return response with 200 and stringify json text
  return NextResponse.json({ text: data.choices[0].text })
}
