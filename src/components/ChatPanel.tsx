import { useEffect, useRef, useState } from "react";
import { MessagesSquare, Send } from "lucide-react";
import { format, parseISO } from "date-fns";

import { ME_ID } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExchangeMessages, useSendMessage } from "@/hooks/useExchange";
import { cn } from "@/lib/utils";

export function ChatPanel({
  listingId,
  counterpartName,
}: {
  listingId: string;
  counterpartName: string;
}) {
  const { data: messages = [] } = useExchangeMessages(listingId);
  const send = useSendMessage(listingId);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function submit() {
    const value = text.trim();
    if (!value) return;
    setText("");
    send.mutate(value);
  }

  return (
    <section className="flex flex-col rounded-xl border border-border/70 bg-card">
      <header className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <MessagesSquare className="size-4 text-primary" />
        <h2 className="font-display text-base font-bold">Обсуждение условий</h2>
      </header>

      <div className="flex max-h-96 min-h-40 flex-col gap-2.5 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="m-auto max-w-xs text-center text-sm text-muted-foreground">
            Сообщений пока нет. Напишите {counterpartName}, чтобы договориться об
            обмене.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.authorId === ME_ID;
            return (
              <div
                key={m.id}
                className={cn("flex flex-col", mine ? "items-end" : "items-start")}
              >
                {!mine && (
                  <span className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">
                    {m.authorName}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  )}
                >
                  {m.text}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
                  {format(parseISO(m.createdAt), "HH:mm")}
                </span>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-center gap-2 border-t border-border/70 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать сообщение…"
          aria-label="Сообщение"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Отправить"
          disabled={!text.trim() || send.isPending}
        >
          <Send className="size-4" />
        </Button>
      </form>
    </section>
  );
}
