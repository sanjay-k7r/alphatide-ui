import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, model } = body;

    console.log('[Assistant API] Request received:', { message, sessionId, model });

    // Get webhook URL from environment
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

    console.log('[Assistant API] Webhook URL:', webhookUrl);

    if (!webhookUrl) {
      console.error('[Assistant API] No webhook URL configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Make request to workflow webhook using POST with JSON body
    console.log('[Assistant API] Sending to workflow webhook...');
    console.log('[Assistant API] Webhook URL:', webhookUrl);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message,
        model: model || 'claude-4-5', // Default to claude-4-5 if not provided
        sessionId, // Pass sessionId for chat memory
      }),
    });

    console.log('[Assistant API] Response status:', response.status);
    console.log('[Assistant API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Assistant API] Error response:', errorText);
      throw new Error(`Webhook returned ${response.status}: ${errorText}`);
    }

    // Stream the response back to the client
    // Workflow sends newline-delimited JSON, we'll forward it as text/event-stream
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
              console.log('[Assistant API] Stream complete');
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log('[Assistant API] Received chunk:', chunk.length, 'bytes');
            console.log('[Assistant API] Chunk content:', chunk);

            buffer += chunk;

            // Split by newlines to process complete JSON objects
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            console.log('[Assistant API] Processing', lines.length, 'lines');

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  console.log('[Assistant API] Parsed data:', data);
                  if (data.type === 'item' && data.content) {
                    console.log('[Assistant API] Sending content chunk:', data.content);
                    // Send each content chunk as it arrives
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: data.content })}\n\n`));
                  }
                } catch (parseError) {
                  console.warn('[Assistant API] Failed to parse line:', line, parseError);
                }
              }
            }
          }
        } catch (error) {
          console.error('[Assistant API] Stream error:', error);
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
    console.error('[Assistant API] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process chat message',
        details: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
