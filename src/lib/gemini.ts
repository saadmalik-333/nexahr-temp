import Groq from 'groq-sdk';

export interface GeminiAnalysis {
  score: number;
  summary: string;
  flags: string[];
  recommendation: 'strong' | 'average' | 'weak';
}

export async function analyzeCandidate(data: {
  name: string;
  designation: string;
  department: string;
  experience: number;
  description: string;
}): Promise<GeminiAnalysis> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('GROQ_API_KEY is not defined in environment variables');
    return getDefaultAnalysis('AI configuration missing');
  }

  try {
    const groq = new Groq({ apiKey });

    const prompt = `Analyze this job application and return ONLY a valid JSON response with no extra text:
{
  "score": (number 0-100, overall profile strength),
  "summary": "2-3 sentence professional summary of this candidate",
  "flags": ["array of any concerns or red flags, empty array if none"],
  "recommendation": "strong" or "average" or "weak"
}

Candidate Details:
Name: ${data.name}
Designation: ${data.designation}
Department: ${data.department}
Experience: ${data.experience} years
About: ${data.description}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content || '';

    if (!text) {
      throw new Error('Empty response from Groq');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      score: Math.min(100, Math.max(0, typeof parsed.score === 'number' ? parsed.score : 50)),
      summary: parsed.summary || 'No summary available.',
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      recommendation: parsed.recommendation || 'average',
    };
  } catch (error) {
    console.error('Groq analysis error:', error);
    return getDefaultAnalysis('AI analysis failed');
  }
}

function getDefaultAnalysis(reason: string): GeminiAnalysis {
  return {
    score: 50,
    summary: `AI analysis could not be completed (${reason}). Manual review recommended.`,
    flags: ['AI analysis unavailable'],
    recommendation: 'average',
  };
}