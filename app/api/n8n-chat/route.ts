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

    // Stream the response back to the client
    // n8n sends newline-delimited JSON, we'll forward it as text/event-stream
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        if (!reader) {
          controller.close();
          return;
        }

        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('[N8N API] Stream complete');
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log('[N8N API] Received chunk:', chunk.length, 'bytes');
            console.log('[N8N API] Chunk content:', chunk);

            buffer += chunk;

            // Split by newlines to process complete JSON objects
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            console.log('[N8N API] Processing', lines.length, 'lines');

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  console.log('[N8N API] Parsed data:', data);
                  if (data.type === 'item' && data.content) {
                    console.log('[N8N API] Sending content chunk:', data.content);
                    // Send each content chunk as it arrives
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: data.content })}\n\n`));
                  }
                } catch (e) {
                  console.warn('[N8N API] Failed to parse line:', line);
                }
              }
            }
          }
        } catch (error) {
          console.error('[N8N API] Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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
