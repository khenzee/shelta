"use client";

import { useEffect, useState } from "react";
import { Bot, History, MessageCircle, Plus, Send, Square, X } from "lucide-react";

export default function AssistantPanel({ route }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/assistant/conversations").then((response) => response.ok ? response.json() : []).then(setConversations).catch(() => {});
  }, [open]);

  async function openConversation(id) {
    const response = await fetch(`/api/assistant/conversations/${id}`);
    if (!response.ok) return;
    const conversation = await response.json();
    setConversationId(id);
    setMessages(conversation.messages.map((message) => ({ role: message.role.toLowerCase(), content: message.content })));
  }

  function newConversation() {
    setConversationId(null);
    setMessages([]);
    setInput("");
  }

  async function send(event) {
    event.preventDefault();
    const content = input.trim();
    if (!content || pending) return;
    const userMessage = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setPending(true);
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, route, conversationId }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || "Assistant unavailable");
      }
      const nextConversationId = response.headers.get("x-conversation-id");
      if (nextConversationId) setConversationId(nextConversationId);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: text }]);
      }
    } catch (error) {
      setMessages([...nextMessages, { role: "assistant", content: error.message }]);
    } finally {
      setPending(false);
    }
  }

  return <>
    <button className="fixed bottom-5 right-5 z-30 flex h-11 items-center gap-2 rounded-full border border-primary bg-primary px-4 font-semibold text-inverse shadow-lg transition-transform hover:scale-[1.02]" onClick={() => setOpen(true)} aria-label="Open Shelta assistant"><MessageCircle size={18} /><span>AI Assistant</span></button>
    {open ? <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-default bg-surface shadow-2xl"><header className="flex items-center justify-between border-b border-default p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded bg-primary text-inverse"><Bot size={16} /></span><div><strong> Shelta assistant</strong><small className="block text-muted">Grounded CRM insights</small></div></div><div className="flex gap-1"><button className="grid size-8 place-items-center rounded border border-default bg-surface" onClick={newConversation} title="New conversation"><Plus size={16} /></button><button className="grid size-8 place-items-center rounded border border-default bg-surface" onClick={() => setOpen(false)} aria-label="Close assistant"><X size={16} /></button></div></header>{conversations.length ? <div className="flex gap-2 overflow-x-auto border-b border-default p-2">{conversations.slice(0, 5).map((conversation) => <button className="flex min-w-32 items-center gap-1 rounded bg-subtle px-2 py-1 text-left text-xs text-secondary" key={conversation.id} onClick={() => openConversation(conversation.id)}><History size={12} /><span className="truncate">{conversation.title || "Conversation"}</span></button>)}</div> : null}<div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.length === 0 ? <div className="rounded-md bg-subtle p-4 text-sm text-secondary"><strong className="block text-primary">Ask about your workspace</strong><span>Try “Show vacant units” or “Which leases expire soon?”</span></div> : messages.map((message, index) => <div className={message.role === "user" ? "ml-8 rounded-md bg-primary p-3 text-sm text-inverse" : "mr-8 whitespace-pre-wrap rounded-md bg-subtle p-3 text-sm text-primary"} key={index}>{message.content || "Thinking..."}</div>)}</div><form className="flex gap-2 border-t border-default p-4" onSubmit={send}><input className="min-w-0 flex-1 rounded border border-default bg-surface px-3" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Shelta..." disabled={pending} /><button className="grid size-10 place-items-center rounded bg-primary text-inverse disabled:opacity-50" disabled={pending || !input.trim()} aria-label={pending ? "Generating response" : "Send message"}>{pending ? <Square size={14} /> : <Send size={16} />}</button></form></aside> : null}
  </>;
}
