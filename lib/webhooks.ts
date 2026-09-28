// lib/webhooks.ts
// Asynchronous Webhook Dispatcher with HMAC-SHA256 Signatures
// Authoritative specification: TIER 4 (T4 - PLATFORM APIS & EXTENSIONS)

import crypto from 'node:crypto';
import sql from '@/lib/db';
import type { DbWebhook } from '@/src/types/db';

export interface WebhookEventPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * Dispatches an event payload to all active webhooks registered for the event type.
 * Signs each request using HMAC-SHA256 with the webhook's private secret token.
 */
export async function dispatchWebhook(
  eventType: string,
  payloadData: Record<string, unknown>
): Promise<{ dispatched: number; failed: number }> {
  try {
    const webhooks = await sql<DbWebhook[]>`
      SELECT id, target_url, event_type, is_active, secret_token, created_at
      FROM webhooks
      WHERE is_active = TRUE
        AND (event_type = ${eventType} OR event_type = '*');
    `;

    if (webhooks.length === 0) {
      return { dispatched: 0, failed: 0 };
    }

    const payload: WebhookEventPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payloadData,
    };

    const bodyString = JSON.stringify(payload);
    let dispatched = 0;
    let failed = 0;

    await Promise.allSettled(
      webhooks.map(async (hook) => {
        try {
          const signature = crypto
            .createHmac('sha256', hook.secret_token)
            .update(bodyString)
            .digest('hex');

          const response = await fetch(hook.target_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Dogfood-Event': eventType,
              'X-Dogfood-Signature': `sha256=${signature}`,
              'User-Agent': 'Dogfood-Webhook-Dispatcher/1.0',
            },
            body: bodyString,
            signal: AbortSignal.timeout(3000), // Non-blocking 3s timeout
          });

          if (response.ok) {
            dispatched++;
          } else {
            failed++;
          }
        } catch {
          // Failure logged gracefully; webhooks must not break main flow
          failed++;
        }
      })
    );

    return { dispatched, failed };
  } catch (err) {
    console.error('[WEBHOOKS] Error in dispatchWebhook:', err);
    return { dispatched: 0, failed: 0 };
  }
}
