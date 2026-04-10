"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const REVERB_APP_KEY =
  process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "gmay5rogzumjxrrrg5l6";
const REVERB_HOST = process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost";
const REVERB_PORT = process.env.NEXT_PUBLIC_REVERB_PORT ?? "8080";

export interface PortfolioViewedPayload {
  portfolio_id: number;
  today_views: number;
  viewed_at: string;
}

export interface PortfolioLinkClickedPayload {
  portfolio_id: number;
  link_type: string;
  clicked_at: string;
}

interface Callbacks {
  onViewed?: (payload: PortfolioViewedPayload) => void;
  onLinkClicked?: (payload: PortfolioLinkClickedPayload) => void;
}

/**
 * Connects to Laravel Reverb (Pusher-protocol WebSocket) and listens on
 * channel analytics.{portfolioId} for:
 *   - portfolio.viewed       → onViewed
 *   - portfolio.link_clicked → onLinkClicked
 *
 * Returns whether the WS connection is established.
 */
export function useAnalyticsRealtime(
  portfolioId: string | null,
  callbacks: Callbacks,
): boolean {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const channelRef = useRef<string | null>(null);
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  const subscribe = useCallback((ws: WebSocket, channel: string) => {
    ws.send(
      JSON.stringify({
        event: "pusher:subscribe",
        data: { auth: "", channel },
      }),
    );
  }, []);

  useEffect(() => {
    if (!portfolioId || portfolioId === "__global__") {
      setIsConnected(false);
      return;
    }

    const channel = `analytics.${portfolioId}`;
    const wsUrl = `ws://${REVERB_HOST}:${REVERB_PORT}/app/${REVERB_APP_KEY}?protocol=7&client=js&version=8.0`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setIsConnected(false);

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as {
          event: string;
          channel?: string;
          data: unknown;
        };

        // Debug: log all messages in dev
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn("[Reverb]", msg.event, msg.channel ?? "", msg.data);
        }

        if (msg.event === "pusher:connection_established") {
          subscribe(ws, channel);
          channelRef.current = channel;
          return;
        }

        // Reverb sends pusher_internal:subscription_succeeded for public channels
        if (
          msg.event === "pusher_internal:subscription_succeeded" ||
          msg.event === "pusher:subscription_succeeded"
        ) {
          setIsConnected(true);
          return;
        }

        const parseData = <T>(raw: unknown): T =>
          typeof raw === "string" ? (JSON.parse(raw) as T) : (raw as T);

        // Match both with and without the broadcastAs prefix
        const evtViewed =
          msg.event === "portfolio.viewed" ||
          msg.event.endsWith("portfolio.viewed");
        const evtClicked =
          msg.event === "portfolio.link_clicked" ||
          msg.event.endsWith("portfolio.link_clicked");
        const inChannel = !msg.channel || msg.channel === channel;

        if (evtViewed && inChannel) {
          cbRef.current.onViewed?.(parseData<PortfolioViewedPayload>(msg.data));
        }

        if (evtClicked && inChannel) {
          cbRef.current.onLinkClicked?.(
            parseData<PortfolioLinkClickedPayload>(msg.data),
          );
        }
      } catch {
        // malformed message — ignore
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN && channelRef.current) {
        ws.send(
          JSON.stringify({
            event: "pusher:unsubscribe",
            data: { channel: channelRef.current },
          }),
        );
      }
      ws.close();
      wsRef.current = null;
      channelRef.current = null;
    };
  }, [portfolioId, subscribe]);

  return isConnected;
}
