import { useState, useRef, useEffect, useCallback } from "react";
import axiosInstance from "../../network/httpRequest";
import ReactMarkdown from "react-markdown";

const SUGGESTIONS = [
    "你好 nghĩa là gì?",
    "Phân biệt 的/地/得",
    "Cách dùng 了 trong câu",
    "Từ vựng chủ đề gia đình",
];

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "bot",
            content:
                "Xin chào! 你好 \nTôi là trợ lý tiếng Trung của **C-learning**. Bạn có thể hỏi tôi về:\n- Nghĩa của từ vựng tiếng Trung\n- 📝 Ngữ pháp & cách dùng\n- 💬 Ví dụ câu thực tế\n- 🎯 Mẹo học tiếng Trung\n\nHãy hỏi tôi bất cứ điều gì!",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const sendMessage = async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;

        const userMsg = { role: "user", content: msg };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const history = messages
                .filter((m) => m.role !== "bot" || messages.indexOf(m) !== 0)
                .map((m) => ({ role: m.role === "user" ? "user" : "model", content: m.content }));

            const { data } = await axiosInstance.post("/chatbot", {
                message: msg,
                history,
            });

            setMessages((prev) => [
                ...prev,
                { role: "bot", content: data.data.reply },
            ]);
        } catch (err) {
            const status = err?.response?.status;
            const errMsg =
                status === 401
                    ? "Bạn cần đăng nhập để sử dụng chatbot."
                    : status === 429
                        ? err?.response?.data?.message || "Hệ thống AI đang quá tải. Vui lòng thử lại sau 1 phút."
                        : "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.";
            setMessages((prev) => [...prev, { role: "bot", content: errMsg }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
                title="Trợ lý tiếng Trung"
            >
                {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-red-100 flex flex-col overflow-hidden transition-all duration-300 ${expanded
                        ? "bottom-4 right-4 w-[min(780px,calc(100vw-2rem))] h-[calc(100vh-2rem)]"
                        : "bottom-24 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)]"
                    }`}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-700 to-red-800 px-4 py-3 flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold text-white">
                            C
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-sm">Trợ lý tiếng Trung</div>
                            <div className="text-red-200 text-xs">C-learning AI • Sẵn sàng hỗ trợ</div>
                        </div>
                        {/* Expand/collapse button */}
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="text-white/70 hover:text-white transition p-1"
                            title={expanded ? "Thu nhỏ" : "Mở rộng"}
                        >
                            {expanded ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25M9 15H4.5M9 15v4.5M9 15 3.75 20.25" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-white/70 hover:text-white transition p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-red-50/30 to-white">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-red-700 text-white rounded-br-md"
                                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm"
                                        }`}
                                >
                                    {msg.role === "bot" ? (
                                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-1.5 prose-strong:text-red-700">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <span>{msg.content}</span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Suggestions (only when few messages) */}
                    {messages.length <= 2 && !loading && (
                        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-1.5 shrink-0">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="text-xs px-2.5 py-1.5 rounded-full bg-white border border-red-200 text-red-700 hover:bg-red-50 transition whitespace-nowrap"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 py-2.5 border-t border-gray-100 bg-white shrink-0">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Hỏi về từ vựng, ngữ pháp..."
                                rows={1}
                                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 max-h-24 transition"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="w-9 h-9 rounded-xl bg-red-700 text-white flex items-center justify-center hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
