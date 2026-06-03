import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

function apiPlugin(): Plugin {
  let apiKey = ''

  return {
    name: 'tend-api',

    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), '')
      apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || ''
    },

    configureServer(server) {
      server.middlewares.use('/api/generate', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        if (!apiKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'OPENAI_API_KEY not configured — add it to .env.local' }))
          return
        }

        const body = await new Promise<string>((resolve, reject) => {
          let data = ''
          req.on('data', (chunk: Buffer) => (data += chunk))
          req.on('end', () => resolve(data))
          req.on('error', reject)
        })

        let diagnosis = '', location = ''
        try {
          const parsed = JSON.parse(body)
          diagnosis = parsed.diagnosis || ''
          location = parsed.location || ''
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }

        const systemPrompt = `You are a compassionate medical navigator helping caregivers understand and manage a health diagnosis. Generate structured, clinically grounded guidance that is warm, specific, and practical. Be like a knowledgeable friend who happens to understand medicine — no jargon, no false hope, no alarm. Return ONLY valid JSON with no markdown fences.`

        const userPrompt = `Generate a care navigation guide for this condition: "${diagnosis}"${location ? `\nThe person is located in: ${location}` : ''}

Return JSON matching this exact structure:
{
  "name": "Properly formatted condition name (e.g. 'Type 2 Diabetes', 'Parkinson's Disease, early stage')",
  "summary": "2–3 sentences. What this diagnosis typically means in plain language, the general treatment landscape, and what the coming weeks are about emotionally and logistically. Warm, not alarming.",
  "selfCare": "2 sentences of compassionate guidance specifically for the caregiver — the person doing the holding, not the patient. Acknowledge the emotional weight without being melodramatic.",
  "specialists": [
    {
      "id": "kebab-case-unique-id",
      "role": "Specialist role (e.g. 'Cardiologist', 'Neurologist')",
      "oneLine": "One sentence on what this specialist does in the context of this condition",
      "description": "2–3 sentences describing their specific role in care for this condition and why they matter right now",
      "questions": [
        "5 specific, high-value questions to ask this specialist about this condition"
      ],
      "bring": [
        "3–5 concrete, specific things to bring to this appointment"
      ]
    }
  ],
  "conversation": {
    "theyAsk": [
      "4 questions the doctor or specialist will realistically ask at the next appointment"
    ],
    "youAsk": [
      "5 questions worth asking at the next appointment"
    ]
  },
  "horizon": [
    {"label": "Next 30 days", "body": "What typically happens in the first month"},
    {"label": "Next 60 days", "body": "What the second month looks like"},
    {"label": "Next 90 days", "body": "How things typically settle at 3 months"}
  ]
}

Include 3–5 relevant specialists. Be specific to this diagnosis, not generic. ${location ? `Where relevant, mention resources or approaches relevant to ${location}.` : ''}`

        try {
          const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
            }),
          })

          if (!apiRes.ok) {
            const errText = await apiRes.text()
            throw new Error(`OpenAI API ${apiRes.status}: ${errText}`)
          }

          const data = await apiRes.json() as { choices: { message: { content: string } }[] }
          const text = data.choices[0].message.content.trim()
          const result = JSON.parse(text)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(result))
        } catch (err) {
          console.error('[tend-api] Error:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
})
