"use client";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";
import { sendMessage } from "@/ai/flows/chat-flow";
import { useAuth } from "@/context/auth-context";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  timestamp: {
    toDate: () => Date;
  } | null;
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
}

interface CaseBoardChatProps {
  caseId: string;
}

export function CaseBoardChat({ caseId }: CaseBoardChatProps) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "cases", caseId, "messages"),
      orderBy("timestamp", "asc")
    );
  }, [firestore, caseId]);

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || !user) return;

    setIsSending(true);
    const messageContent = input;
    setInput("");

    try {
      await sendMessage({
        caseId: caseId,
        user: user,
        content: messageContent,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setInput(messageContent); // Restore input on failure
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  
  if (isLoading) {
    return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <div className="flex flex-col h-[60vh]">
      <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
        <div className="space-y-6 pr-4">
          {messages && messages.map((message) => {
            const isCurrentUser = message.user.id === user?.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.user.avatar} data-ai-hint="person" />
                    <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-semibold">{isCurrentUser ? "You" : message.user.name}</span>
                      {message.timestamp && (
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true })}
                        </span>
                      )}
                   </div>
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-sm text-sm mt-1",
                      isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
                 {isCurrentUser && user && (
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={user.avatar} data-ai-hint="person" alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="mt-4">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending}
            autoComplete="off"
          />
          <Button type="submit" disabled={isSending || !input.trim()} size="icon">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
