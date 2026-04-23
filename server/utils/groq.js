/**
 * Groq API helper — replaces all PHP cURL calls to Groq
 */
async function callGroq(messages, options = {}) {
  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.0,
    maxTokens = 700
  } = options;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  return content;
}

/**
 * Extract JSON from AI response — handles markdown fences, extra text
 */
function extractJSON(text) {
  // Remove markdown fences
  let raw = text.trim();
  raw = raw.replace(/^```(?:json)?\s*/i, '');
  raw = raw.replace(/\s*```$/i, '');

  // Try direct parse
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object') return parsed;
  } catch {}

  // Try to extract largest JSON object
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (typeof parsed === 'object') return parsed;
    } catch {}
  }

  return null;
}

module.exports = { callGroq, extractJSON };
