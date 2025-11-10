"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  Headphones,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "agent" | "bot";
  message: string;
  timestamp: Date;
  type?: "text" | "quick-reply" | "file" | "system";
  quickReplies?: string[];
  agentInfo?: {
    name: string;
    avatar?: string;
    status: "online" | "away" | "busy";
  };
}

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "busy";
  specialties: string[];
  rating: number;
}

const agents: Agent[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    specialties: ["Booking Support", "Celebrity Questions"],
    rating: 4.9,
  },
  {
    id: "2",
    name: "Mike Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    specialties: ["Technical Support", "Account Issues"],
    rating: 4.8,
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    specialties: ["Billing", "Refunds"],
    rating: 4.9,
  },
];

const quickReplies = [
  "How do I book a celebrity?",
  "What are your prices?",
  "How long does delivery take?",
  "Can I get a refund?",
  "Technical support",
  "Speak to an agent",
];

const botResponses: Record<
  string,
  { message: string; quickReplies?: string[] }
> = {
  "how do i book a celebrity": {
    message:
      "Booking is easy! 1) Browse celebrities 2) Select your favorite 3) Fill out the request form 4) Complete payment. Would you like me to guide you through the process?",
    quickReplies: [
      "Yes, guide me",
      "Show me celebrities",
      "I need help with payment",
    ],
  },
  "what are your prices": {
    message:
      "Prices vary by celebrity and service. Personal messages often start around $99, and business endorsements vary by talent. Would you like to see specific pricing?",
    quickReplies: [
      "Show celebrity prices",
      "Business pricing",
      "Discount options",
    ],
  },
  "how long does delivery take": {
    message:
      "Most celebrities deliver within 3-7 days. Some offer asap delivery (12 hours) for an additional fee. Each celebrity's profile shows their typical response time.",
    quickReplies: [
      "asap delivery info",
      "Track my order",
      "Celebrity response times",
    ],
  },
  "can i get a refund": {
    message:
      "Yes! We offer a 100% satisfaction guarantee. If you're not happy with your video, we'll work to make it right or provide a full refund within 30 days.",
    quickReplies: ["Refund policy", "Request refund", "Speak to agent"],
  },
  "technical support": {
    message:
      "I can help with technical issues! What problem are you experiencing?",
    quickReplies: [
      "Video won't play",
      "Login issues",
      "Payment problems",
      "App not working",
    ],
  },
  "speak to an agent": {
    message:
      "I'll connect you with one of our support agents. They typically respond within 2-3 minutes during business hours.",
    quickReplies: ["Connect now", "Schedule callback", "Leave message"],
  },
};

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [chatMode, setChatMode] = useState<"bot" | "agent">("bot");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        sender: "bot",
        message:
          "Hi! I'm Kia, your virtual assistant. How can I help you today?",
        timestamp: new Date(),
        type: "quick-reply",
        quickReplies: quickReplies.slice(0, 4),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate unread messages when closed
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          setUnreadCount((prev) => prev + 1);
        }
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      message: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot/agent response
    setTimeout(() => {
      setIsTyping(false);

      if (chatMode === "bot") {
        handleBotResponse(text.toLowerCase());
      } else {
        handleAgentResponse(text);
      }
    }, 1000 + Math.random() * 2000);
  };

  const handleBotResponse = (userMessage: string) => {
    let response = botResponses[userMessage] || {
      message:
        "I understand you need help with that. Let me connect you with one of our support agents who can assist you better.",
      quickReplies: ["Connect to agent", "Try again", "Main menu"],
    };

    // Special handling for agent connection
    if (userMessage.includes("agent") || userMessage.includes("human")) {
      response = {
        message:
          "I'll connect you with a live agent right now. Please hold on...",
      };
      setTimeout(() => connectToAgent(), 2000);
    }

    const botMessage: Message = {
      id: Date.now().toString(),
      sender: "bot",
      message: response.message,
      timestamp: new Date(),
      type: response.quickReplies ? "quick-reply" : "text",
      quickReplies: response.quickReplies,
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  const handleAgentResponse = (userMessage: string) => {
    const responses = [
      "Thanks for reaching out! I'm looking into that for you right now.",
      "I understand your concern. Let me check our system for more details.",
      "That's a great question! I'll get you the most up-to-date information.",
      "I'm here to help! Let me pull up your account details.",
      "I see what you mean. Let me connect with our team to get you the best solution.",
    ];

    const agentMessage: Message = {
      id: Date.now().toString(),
      sender: "agent",
      message: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      agentInfo: currentAgent || undefined,
    };

    setMessages((prev) => [...prev, agentMessage]);
  };

  const connectToAgent = () => {
    setIsConnecting(true);
    setChatMode("agent");

    setTimeout(() => {
      const availableAgent =
        agents.find((agent) => agent.status === "online") || agents[0];
      setCurrentAgent(availableAgent);
      setIsConnecting(false);

      const connectionMessage: Message = {
        id: Date.now().toString(),
        sender: "system",
        message: `You're now connected with ${availableAgent.name}. They'll be with you shortly!`,
        timestamp: new Date(),
        type: "system",
      };

      const agentGreeting: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        message: `Hi! I'm ${availableAgent.name} from Kia Ora support. How can I help you today?`,
        timestamp: new Date(),
        agentInfo: availableAgent,
      };

      setMessages((prev) => [...prev, connectionMessage, agentGreeting]);

      toast.success("Connected to Agent", {
        description: `You're now chatting with ${availableAgent.name}`,
      });
    }, 3000);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleRating = (rating: "up" | "down") => {
    toast.success("Feedback Received", {
      description: `Thank you for rating our ${
        chatMode === "bot" ? "bot" : "agent"
      } support!`,
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={toggleChat}
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? "60px" : "500px",
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 w-80 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <div className="flex items-center gap-3">
                {chatMode === "agent" && currentAgent ? (
                  <>
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={currentAgent.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="bg-purple-500 text-white text-sm">
                        {currentAgent.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        {currentAgent.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            currentAgent.status === "online"
                              ? "bg-green-400"
                              : currentAgent.status === "away"
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                        />
                        <span className="text-purple-200 text-xs capitalize">
                          {currentAgent.status}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        Kia Assistant
                      </h3>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-purple-200 text-xs">Online</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-6 h-6 text-white hover:bg-white/10"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-3 h-3" />
                  ) : (
                    <Minimize2 className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 text-white hover:bg-white/10"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {isConnecting && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4" />
                        <p className="text-purple-200 text-sm">
                          Connecting you to an agent...
                        </p>
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-l-2xl rounded-tr-2xl"
                            : message.sender === "system"
                            ? "bg-blue-500/20 text-blue-200 rounded-2xl text-center w-full"
                            : "bg-white/10 text-white rounded-r-2xl rounded-tl-2xl"
                        } p-3`}
                      >
                        {message.sender === "agent" && message.agentInfo && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage
                                src={
                                  message.agentInfo.avatar || "/placeholder.svg"
                                }
                              />
                              <AvatarFallback className="bg-purple-500 text-white text-xs">
                                {message.agentInfo.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-purple-300">
                              {message.agentInfo.name}
                            </span>
                          </div>
                        )}

                        <p className="text-sm">{message.message}</p>

                        {message.quickReplies && (
                          <div className="mt-3 space-y-2">
                            {message.quickReplies.map((reply, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickReply(reply)}
                                className="w-full text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                {reply}
                              </Button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {message.sender !== "user" &&
                            message.sender !== "system" && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRating("up")}
                                  className="w-4 h-4 p-0 text-white/50 hover:text-green-400 hover:bg-transparent"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRating("down")}
                                  className="w-4 h-4 p-0 text-white/50 hover:text-red-400 hover:bg-transparent"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-white rounded-r-2xl rounded-tl-2xl p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/20">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type your message..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {chatMode === "bot" && (
                    <div className="flex items-center justify-center mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickReply("speak to an agent")}
                        className="text-xs text-purple-300 hover:text-white hover:bg-white/10"
                      >
                        <Headphones className="w-3 h-3 mr-1" />
                        Speak to a human agent
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
