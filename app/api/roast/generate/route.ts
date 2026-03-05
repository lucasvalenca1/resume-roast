import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';

interface GenerateRoastBody {
    fileName: string;
    roastType: string;
    cloud_storage_path: string;
    isPublic: boolean;
    fileData: string;
    fileType: string;
}

async function extractTextFromDocx(base64Data: string): Promise<string> {
    try {
          const buffer = Buffer.from(base64Data, 'base64');
          const result = await mammoth.extractRawText({ buffer });
          return result?.value ?? '';
    } catch (error) {
          console.error('DOCX extraction error:', error);
          throw new Error('Failed to extract text from DOCX');
    }
}

function getRoastPrompt(roastType: string, resumeContent: string): string {
    return `You are a professional resume reviewer with a knack for providing honest, detailed feedback. Analyze this resume and provide a comprehensive roast in the "${roastType}" tone.

    Resume Content:
    ${resumeContent}

    Provide your analysis in the following JSON format:
    {
      "overallRoast": "Your main roast/critique (2-3 paragraphs)",
        "scores": {
            "overall": 75,
                "formatting": 80,
                    "content": 70,
                        "experience": 75,
                            "skills": 65
                              },
                                "sections": [
                                    {
                                          "title": "Summary/Objective",
                                                "content": "Analysis of this section",
                                                      "score": 75,
                                                            "issues": ["Issue 1", "Issue 2"],
                                                                  "suggestions": ["Suggestion 1", "Suggestion 2"]
                                                                      },
                                                                          {
                                                                                "title": "Experience",
                                                                                      "content": "Analysis of experience section",
                                                                                            "score": 70,
                                                                                                  "issues": ["Issue 1"],
                                                                                                        "suggestions": ["Suggestion 1"]
                                                                                                            },
                                                                                                                {
                                                                                                                      "title": "Skills",
                                                                                                                            "content": "Analysis of skills section",
                                                                                                                                  "score": 65,
                                                                                                                                        "issues": ["Issue 1"],
                                                                                                                                              "suggestions": ["Suggestion 1"]
                                                                                                                                                  },
                                                                                                                                                      {
                                                                                                                                                            "title": "Education",
                                                                                                                                                                  "content": "Analysis of education section",
                                                                                                                                                                        "score": 80,
                                                                                                                                                                              "issues": [],
                                                                                                                                                                                    "suggestions": ["Suggestion 1"]
                                                                                                                                                                                        },
                                                                                                                                                                                            {
                                                                                                                                                                                                  "title": "Formatting & Structure",
                                                                                                                                                                                                        "content": "Analysis of overall formatting",
                                                                                                                                                                                                              "score": 75,
                                                                                                                                                                                                                    "issues": ["Issue 1"],
                                                                                                                                                                                                                          "suggestions": ["Suggestion 1"]
                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                ]
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                
                                                                                                                                                                                                                                Roast Style Guidelines:
                                                                                                                                                                                                                                - Humorous: Be funny and witty, use humor while still being constructive
                                                                                                                                                                                                                                - Constructive: Be balanced, professional, and helpful with specific actionable advice
                                                                                                                                                                                                                                - Brutal: Be extremely honest, direct, and pull no punches (but still professional)
                                                                                                                                                                                                                                
                                                                                                                                                                                                                                Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;
}

export async function POST(request: NextRequest) {
    try {
          const body: GenerateRoastBody = await request?.json?.();
          const { fileName, roastType, cloud_storage_path, isPublic, fileData, fileType } = body ?? {};

      if (!fileName || !roastType || !cloud_storage_path || !fileData || !fileType) {
              return new Response(
                        JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
                      );
      }

      let resumeText = '';
          if (fileType === 'docx') {
                  resumeText = await extractTextFromDocx(fileData.split(',')[1] ?? fileData);
          } else {
                  resumeText = '[PDF content - analyze based on context]';
          }

      const messages = [
        {
                  role: 'user',
                  content: getRoastPrompt(roastType, resumeText)
        }
            ];

      // Call Groq API (free)
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
              },
              body: JSON.stringify({
                        model: 'llama3-8b-8192',
                        messages: messages,
                        stream: true,
                        max_tokens: 3000,
                        response_format: { type: 'json_object' }
              })
      });

      if (!response?.ok) {
              throw new Error('Groq API request failed');
      }

      const reader = response?.body?.getReader?.();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();

      const stream = new ReadableStream({
              async start(controller) {
                        let buffer = '';
                        let partialRead = '';
                        try {
                                    while (true) {
                                                  const { done, value } = await reader?.read?.() ?? { done: true, value: undefined };
                                                  if (done) break;
                                                  partialRead += decoder?.decode?.(value, { stream: true }) ?? '';
                                                  let lines = partialRead?.split?.('\n') ?? [];
                                                  partialRead = lines?.pop?.() ?? '';
                                                  for (const line of lines ?? []) {
                                                                  if (line?.startsWith?.('data: ')) {
                                                                                    const data = line?.slice?.(6) ?? '';
                                                                                    if (data === '[DONE]') {
                                                                                                        try {
                                                                                                                              const finalResult = JSON.parse(buffer);
                                                                                                                              const roast = await prisma.roast.create({
                                                                                                                                                      data: {
                                                                                                                                                                                filename: fileName,
                                                                                                                                                                                roastType: roastType,
                                                                                                                                                                                content: finalResult?.overallRoast ?? '',
                                                                                                                                                                                sections: finalResult?.sections ?? [],
                                                                                                                                                                                scores: finalResult?.scores ?? {},
                                                                                                                                                                                cloudStoragePath: cloud_storage_path,
                                                                                                                                                                                isPublic: isPublic ?? false
                                                                                                                                                        }
                                                                                                                                });
                                                                                                                              const finalData = JSON.stringify({ status: 'completed', roastId: roast?.id, result: finalResult });
                                                                                                                              controller?.enqueue?.(encoder?.encode?.(`data: ${finalData}\n\n`) ?? new Uint8Array());
                                                                                                          } catch (parseError) {
                                                                                                                              console.error('JSON parse error:', parseError);
                                                                                                                              const errorData = JSON.stringify({ status: 'error', message: 'Failed to parse roast response' });
                                                                                                                              controller?.enqueue?.(encoder?.encode?.(`data: ${errorData}\n\n`) ?? new Uint8Array());
                                                                                                          }
                                                                                                        return;
                                                                                      }
                                                                                    try {
                                                                                                        const parsed = JSON.parse(data);
                                                                                                        buffer += parsed?.choices?.[0]?.delta?.content ?? '';
                                                                                                        const progressData = JSON.stringify({ status: 'processing', message: 'Generating roast...' });
                                                                                                        controller?.enqueue?.(encoder?.encode?.(`data: ${progressData}\n\n`) ?? new Uint8Array());
                                                                                      } catch (e) {
                                                                                                        // Skip invalid JSON
                                                                                    }
                                                                  }
                                                  }
                                    }
                        } catch (error) {
                                    console.error('Stream error:', error);
                                    const errorData = JSON.stringify({ status: 'error', message: 'Failed to generate roast' });
                                    controller?.enqueue?.(encoder?.encode?.(`data: ${errorData}\n\n`) ?? new Uint8Array());
                        } finally {
                                    controller?.close?.();
                        }
              }
      });

      return new Response(stream, {
              headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
              }
      });
    } catch (error) {
          console.error('Roast generation error:', error);
          return new Response(
                  JSON.stringify({ error: 'Failed to generate roast' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
    }
}
