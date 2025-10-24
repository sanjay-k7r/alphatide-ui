import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    console.log('[N8N API] Request received:', { message, sessionId });

    // Get webhook URL from environment
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

    console.log('[N8N API] Webhook URL:', webhookUrl);

    if (!webhookUrl) {
      console.error('[N8N API] No webhook URL configured');
      return new Response(
        JSON.stringify({ error: 'N8N webhook URL not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Make request to n8n webhook using POST with JSON body
    console.log('[N8N API] Sending to n8n webhook...');
    console.log('[N8N API] Webhook URL:', webhookUrl);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message,
      }),
    });

    console.log('[N8N API] Response status:', response.status);
    console.log('[N8N API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[N8N API] Error response:', errorText);
      throw new Error(`N8N webhook returned ${response.status}: ${errorText}`);
    }

    // n8n returns a streaming response with newline-delimited JSON
    // We need to parse the stream and combine the content
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split by newlines to process complete JSON objects
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'item' && data.content) {
              fullContent += data.content;
            }
          } catch (e) {
            console.warn('[N8N API] Failed to parse line:', line);
          }
        }
      }
    }

    console.log('[N8N API] Full content:', fullContent);

    // Return the combined response
    return new Response(JSON.stringify({ output: fullContent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[N8N API] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process chat message',
        details: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
