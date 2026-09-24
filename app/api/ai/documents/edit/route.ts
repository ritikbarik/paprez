import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/utils';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'poolside/laguna-xs-2.1:free';
const MAX_TEXT_CHARS = 16000;

function trimDocument(text: string) {
  return text.slice(0, MAX_TEXT_CHARS);
}

function fallbackEdit(documentText: string, instruction: string) {
  const normalized = documentText.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  return [
    normalized,
    '',
    'AI edit note:',
    `Requested change: ${instruction}`,
    'OpenRouter is not configured, so PAPrez applied basic cleanup only.'
  ].join('\n');
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { documentText, instruction, pageRange } = await request.json();
  if (!documentText || !instruction) {
    return NextResponse.json({ error: 'Document text and edit instruction are required.' }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const selectedText = trimDocument(String(documentText));
  const scope = pageRange ? `Only apply edits to this page/data range: ${pageRange}.` : 'Apply edits to the provided text only.';

  if (!apiKey) {
    return NextResponse.json({
      model,
      editedText: fallbackEdit(selectedText, String(instruction))
    });
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'PAPrez'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You edit user-uploaded print documents. Preserve meaning, keep formatting readable, and return only the revised document text.'
        },
        {
          role: 'user',
          content: `${scope}\nInstruction: ${instruction}\n\nDocument:\n${selectedText}`
        }
      ],
      temperature: 0.2,
      max_tokens: 2500
    })
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'AI edit failed.' }, { status: 502 });
  }

  const data = await res.json();
  const editedText = data.choices?.[0]?.message?.content || selectedText;

  return NextResponse.json({ model, editedText });
}
