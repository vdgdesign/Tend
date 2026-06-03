/// <reference types="node" />
/* eslint-disable @typescript-eslint/no-explicit-any */
const systemPrompt = `You are a compassionate medical navigator helping caregivers understand and manage a health diagnosis. Generate structured, clinically grounded guidance that is warm, specific, and practical. Be like a knowledgeable friend who happens to understand medicine — no jargon, no false hope, no alarm. Return ONLY valid JSON with no markdown fences.`

function userPrompt(diagnosis: string, location: string) {
  return `Generate a care navigation guide for this condition: "${diagnosis}"${location ? `\nThe person is located in: ${location}` : ''}

Return JSON matching this exact structure:
{
  "name": "Properly formatted condition name",
  "summary": "2–3 sentences. What this diagnosis typically means in plain language, the general treatment landscape, and what the coming weeks are about emotionally and logistically. Warm, not alarming.",
  "selfCare": "2 sentences of compassionate guidance specifically for the caregiver — the person doing the holding, not the patient. Acknowledge the emotional weight without being melodramatic.",
  "specialists": [
    {
      "id": "kebab-case-unique-id",
      "role": "Specialist role",
      "oneLine": "One sentence on what this specialist does in the context of this condition",
      "description": "2–3 sentences describing their specific role in care for this condition",
      "questions": ["5 specific questions to ask this specialist"],
      "bring": ["3–5 concrete things to bring to this appointment"]
    }
  ],
  "conversation": {
    "theyAsk": ["4 questions the doctor will realistically ask"],
    "youAsk": ["5 questions worth asking at the next appointment"]
  },
  "horizon": [
    {"label": "Next 30 days", "body": "What typically happens in the first month"},
    {"label": "Next 60 days", "body": "What the second month looks like"},
    {"label": "Next 90 days", "body": "How things typically settle at 3 months"}
  ]
}

Include 3–5 relevant specialists. Be specific to this diagnosis. ${location ? `Where relevant, mention resources relevant to ${location}.` : ''}`
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }))
    return
  }

  const body = await new Promise<string>((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: any) => (data += chunk))
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
          { role: 'user', content: userPrompt(diagnosis, location) },
        ],
      }),
    })

    if (!apiRes.ok) {
      const errText = await apiRes.text()
      throw new Error(`OpenAI API ${apiRes.status}: ${errText}`)
    }

    const data = await apiRes.json() as { choices: { message: { content: string } }[] }
    const result = JSON.parse(data.choices[0].message.content.trim())

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result))
  } catch (err) {
    console.error('[generate] Error:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: String(err) }))
  }
}
