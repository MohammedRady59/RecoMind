import { createContext, useContext, useState, useEffect, useRef } from "react";
// import { generateResponse } from "../config/gemini";

const ChatBotContext = createContext(undefined);

function ChatBotContextProvider({ children }) {
	const [input, setInput] = useState("");

	// Chat sessions management
	const [chatSessions, setChatSessions] = useState(() => {
		const saved = localStorage.getItem("chatSessions");
		return saved ? JSON.parse(saved) : [];
	});

	const [currentSessionId, setCurrentSessionId] = useState(() => {
		const saved = localStorage.getItem("currentSessionId");
		return saved || null;
	});

	// Get current session
	const currentSession = chatSessions.find((s) => s.id === currentSessionId) || null;

	// Legacy support for sidebar
	const prevPrompts = chatSessions.map((s) => s.title);

	const [showResult, setShowResult] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resultData, setResultData] = useState("");

	const animationRef = useRef(null);

	// Save sessions to localStorage
	useEffect(() => {
		localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
	}, [chatSessions]);

	// Save current session ID
	useEffect(() => {
		if (currentSessionId) {
			localStorage.setItem("currentSessionId", currentSessionId);
		}
	}, [currentSessionId]);

	const cancelAnimation = () => {
		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
			animationRef.current = null;
		}
	};

	useEffect(() => {
		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, []);

	const formatResponse = (text) => {
		let formatted = text;
		formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
		formatted = formatted.replace(/\*(.*?)\*/g, "<i>$1</i>");
		formatted = formatted.replace(/\n/g, "<br />");
		formatted = formatted.replace(/###\s(.*?)(<br \/>|$)/g, "<h3>$1</h3>");
		formatted = formatted.replace(/##\s(.*?)(<br \/>|$)/g, "<h2>$1</h2>");
		formatted = formatted.replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>");
		formatted = formatted.replace(/`(.*?)`/g, "<code>$1</code>");
		return formatted;
	};

	// Create a new chat session
	const newChat = () => {
		cancelAnimation();

		const newSession = {
			id: `session-${Date.now()}`,
			title: "New Chat",
			messages: [],
			conversationHistory: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		setChatSessions((prev) => [newSession, ...prev]);
		setCurrentSessionId(newSession.id);
		setShowResult(false);
		setInput("");
		setLoading(false);
		setResultData("");
	};

	// Update session title based on first message
	const updateSessionTitle = (sessionId, firstMessage) => {
		setChatSessions((prev) =>
			prev.map((session) => {
				if (session.id === sessionId && session.title === "New Chat") {
					return {
						...session,
						title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : ""),
					};
				}
				return session;
			})
		);
	};

	// Rename a chat session
	const renameSession = (sessionId, newTitle) => {
		if (!newTitle || !newTitle.trim()) {
			return false;
		}

		setChatSessions((prev) =>
			prev.map((session) => {
				if (session.id === sessionId) {
					return {
						...session,
						title: newTitle.trim(),
						updatedAt: new Date().toISOString(),
					};
				}
				return session;
			})
		);

		return true;
	};

	// Switch to a different chat session
	const loadSession = (sessionId) => {
		const session = chatSessions.find((s) => s.id === sessionId);
		if (session) {
			cancelAnimation();
			setCurrentSessionId(sessionId);
			setShowResult(session.messages.length > 0);
			setInput("");
			setLoading(false);
			setResultData("");
		}
	};

	// Delete a chat session
	const deleteSession = (sessionId) => {
		setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));

		if (currentSessionId === sessionId) {
			const remaining = chatSessions.filter((s) => s.id !== sessionId);
			if (remaining.length > 0) {
				setCurrentSessionId(remaining[0].id);
			} else {
				setCurrentSessionId(null);
				setShowResult(false);
			}
		}
	};

	async function handleSent(promptText) {
		const promptToSend = promptText || input;

		if (!promptToSend.trim()) {
			return;
		}

		// Create new session if none exists
		if (!currentSessionId) {
			const newSession = {
				id: `session-${Date.now()}`,
				title: promptToSend.slice(0, 30) + (promptToSend.length > 30 ? "..." : ""),
				messages: [],
				conversationHistory: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			setChatSessions((prev) => [newSession, ...prev]);
			setCurrentSessionId(newSession.id);
		}

		cancelAnimation();
		setResultData("");
		setLoading(true);
		setShowResult(true);

		// Add user message
		const userMessage = {
			id: `msg-${Date.now()}`,
			type: "user",
			content: promptToSend,
			timestamp: new Date().toISOString(),
		};

		setChatSessions((prev) =>
			prev.map((session) => {
				if (
					session.id === currentSessionId ||
					(session.messages.length === 0 && !currentSessionId)
				) {
					const updatedSession = {
						...session,
						messages: [...session.messages, userMessage],
						updatedAt: new Date().toISOString(),
					};

					// Update title if it's the first message
					if (session.messages.length === 0) {
						updatedSession.title =
							promptToSend.slice(0, 30) + (promptToSend.length > 30 ? "..." : "");
					}

					return updatedSession;
				}
				return session;
			})
		);

		try {
			let fullResponse = "";
			const session = chatSessions.find((s) => s.id === currentSessionId) || chatSessions[0];

			const result = await generateResponse(
				promptToSend,
				(chunk) => {
					fullResponse += chunk;
					setResultData((prev) => prev + formatResponse(chunk));
				},
				session?.conversationHistory || []
			);

			const formattedResponse = formatResponse(result || fullResponse);

			const aiMessage = {
				id: `msg-${Date.now() + 1}`,
				type: "ai",
				content: formattedResponse,
				timestamp: new Date().toISOString(),
			};

			// Update session with AI response
			setChatSessions((prev) =>
				prev.map((session) => {
					if (session.id === currentSessionId || (prev[0] && !currentSessionId)) {
						return {
							...session,
							messages: [...session.messages, aiMessage],
							conversationHistory: [
								...session.conversationHistory,
								{
									role: "user",
									parts: [{ text: promptToSend }],
								},
								{
									role: "model",
									parts: [{ text: result || fullResponse }],
								},
							],
							updatedAt: new Date().toISOString(),
						};
					}
					return session;
				})
			);
		} catch (error) {
			console.error("Error getting response:", error);
			const errorMessage = {
				id: `msg-${Date.now() + 1}`,
				type: "error",
				content: `<p style="color: red;">Error: ${error.message}</p><p>Please try again or check your API key.</p>`,
				timestamp: new Date().toISOString(),
			};

			setChatSessions((prev) =>
				prev.map((session) => {
					if (session.id === currentSessionId) {
						return {
							...session,
							messages: [...session.messages, errorMessage],
						};
					}
					return session;
				})
			);

			setResultData(errorMessage.content);
		} finally {
			setLoading(false);
			setInput("");
			setResultData("");
		}
	}

	const clearChatHistory = () => {
		cancelAnimation();
		setChatSessions([]);
		setCurrentSessionId(null);
		localStorage.removeItem("chatSessions");
		localStorage.removeItem("currentSessionId");
		setShowResult(false);
		setInput("");
		setResultData("");
	};

	// Legacy function for sidebar compatibility
	const setRecentPrompt = (prompt) => {
		const session = chatSessions.find((s) => s.title.includes(prompt.slice(0, 20)));
		if (session) {
			loadSession(session.id);
		}
	};

	const contextValue = {
		input,
		setInput,
		recentPrompt: currentSession?.title || "",
		setRecentPrompt,
		prevPrompts,
		setPrevPrompts: () => {}, // Legacy support
		showResult,
		setShowResult,
		handleSent,
		resultData,
		setResultData,
		loading,
		setLoading,
		newChat,
		clearChatHistory,
		deletePrompt: deleteSession,
		conversationHistory: currentSession?.conversationHistory || [],
		messages: currentSession?.messages || [],
		setMessages: () => {}, // Managed internally
		// New session management
		chatSessions,
		currentSessionId,
		currentSession,
		loadSession,
		deleteSession,
		renameSession, // ✅ Added rename function
	};

	return <ChatBotContext.Provider value={contextValue}>{children}</ChatBotContext.Provider>;
}

function useChatBot() {
	const context = useContext(ChatBotContext);
	if (context === undefined) {
		throw new Error("useChatBot must be used within a ChatBotContextProvider");
	}
	return context;
}

export { ChatBotContextProvider, useChatBot };
export default useChatBot;