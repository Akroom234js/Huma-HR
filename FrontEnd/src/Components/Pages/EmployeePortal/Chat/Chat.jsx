import React, { useEffect, useState, useRef, useCallback } from "react";
import apiClient from "../../../../apiConfig";
import "./Chat.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";

const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

const Chat = () => {
  const { t, i18n } = useTranslation("EmployeePortal/Chat");
  const isAr = i18n ? i18n.language === "ar" : false;

  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "contacts" | "notifications"
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);

  const storedUser = localStorage.getItem("user");
  const currentUserId = storedUser ? JSON.parse(storedUser).id : null;

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial conversations
  const fetchChats = useCallback(async () => {
    try {
      const response = await apiClient.get("/employee/chats");
      const data = response.data?.data || [];
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, []);

  // Fetch contacts list
  const fetchContacts = useCallback(async () => {
    try {
      const response = await apiClient.get("/employee/chats/contacts");
      setContacts(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiClient.get("/employee/notifications");
      setNotifications(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get("/employee/notifications/unread-count");
      setUnreadCount(response.data?.data?.unread_count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId, silent = false) => {
    if (!conversationId) return;
    if (!silent) setLoading(true);
    try {
      const response = await apiClient.get(`/employee/chats/${conversationId}/messages`);
      setMessages(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchChats();
    fetchContacts();
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchChats, fetchContacts, fetchNotifications, fetchUnreadCount]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat, fetchMessages]);

  // Periodic polling for incoming messages (every 4 seconds)
  useEffect(() => {
    if (!selectedChat) return;
    const interval = setInterval(() => {
      fetchMessages(selectedChat, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedChat, fetchMessages]);

  // Handle Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiClient.post("/employee/notifications/read-all");
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  // Handle notification click safely
  const handleNotificationClick = async (notification) => {
    try {
      await apiClient.post(`/employee/notifications/${notification.id}/read`);
      fetchNotifications();
      fetchUnreadCount();

      if (notification.data) {
        let notificationData = {};
        try {
          notificationData = typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data;
        } catch {
          notificationData = {};
        }

        if (notificationData.conversation_id) {
          setSelectedChat(notificationData.conversation_id);
          setSelectedRecipient(null);
          setActiveTab("chats");
        }
      }
    } catch (error) {
      console.error("Error clicking notification:", error);
    }
  };

  // Send message
  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const payload = selectedChat
        ? { conversation_id: selectedChat, body: trimmed }
        : { recipient_id: selectedRecipient?.user_id || selectedRecipient, body: trimmed };

      const response = await apiClient.post("/employee/chats/send", payload);
      setMessage("");

      const responseData = response.data?.data;
      const conversationId = responseData?.conversation_id || selectedChat;

      if (conversationId && conversationId !== selectedChat) {
        setSelectedChat(conversationId);
        setSelectedRecipient(null);
        setActiveTab("chats");
      } else if (selectedChat) {
        await fetchMessages(selectedChat, true);
      }

      await fetchChats();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to render Avatar or Initial
  const renderAvatar = (picUrl, name, sizeClass = "cn-avatar-md") => {
    const initial = (name || "U").charAt(0).toUpperCase();
    if (picUrl) {
      return (
        <img
          className={`cn-avatar-img ${sizeClass}`}
          src={picUrl.startsWith("http") ? picUrl : `${BASE_IMAGE_URL}/${picUrl}`}
          alt={name}
        />
      );
    }
    return <div className={`cn-avatar-initial ${sizeClass}`}>{initial}</div>;
  };

  // Format time (e.g. 10:30 AM)
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Active chat context
  const currentChat = chats.find((c) => c.id === selectedChat);
  const activeRecipientInfo = currentChat
    ? currentChat.other_participant
    : selectedRecipient;

  // Filtered lists
  const filteredChats = chats.filter((chat) => {
    const name = chat.other_participant?.full_name?.toLowerCase() || "";
    const lastMsg = chat.last_message?.body?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || lastMsg.includes(q);
  });

  const filteredContacts = contacts.filter((c) => {
    const name = c.full_name?.toLowerCase() || "";
    const job = c.job_title?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || job.includes(q);
  });

  const filteredNotifications = notifications.filter((n) => {
    const title = n.title?.toLowerCase() || "";
    const body = n.body?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return title.includes(q) || body.includes(q);
  });

  return (
    <div className={`cn-page ${isAr ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="cn-header-wrapper">
        <div className="cn-title-group">
          <i className="bi bi-chat-dots-fill cn-title-icon"></i>
          <h1 className="cn-title">{t("pageTitle")}</h1>
        </div>
        <div className="cn-theme-toggle">
          <ThemeToggle />
        </div>
      </div>

      <div className="cn-chat-layout">
        {/* Sidebar */}
        <div className="cn-sidebar">
          {/* Tabs */}
          <div className="cn-tabs-bar">
            <button
              type="button"
              className={`cn-tab-btn ${activeTab === "chats" ? "active" : ""}`}
              onClick={() => setActiveTab("chats")}
            >
              <i className="bi bi-chat-left-text-fill me-1"></i>
              <span>{t("tabs.chats")}</span>
            </button>

            <button
              type="button"
              className={`cn-tab-btn ${activeTab === "contacts" ? "active" : ""}`}
              onClick={() => setActiveTab("contacts")}
            >
              <i className="bi bi-people-fill me-1"></i>
              <span>{t("tabs.contacts")}</span>
              <span className="cn-tab-badge">{contacts.length}</span>
            </button>

            <button
              type="button"
              className={`cn-tab-btn ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              <i className="bi bi-bell-fill me-1"></i>
              <span>{t("tabs.notifications")}</span>
              {unreadCount > 0 && <span className="cn-tab-badge alert">{unreadCount}</span>}
            </button>
          </div>

          {/* Search Box */}
          <div className="cn-search-box">
            <i className="bi bi-search cn-search-icon"></i>
            <input
              type="text"
              className="cn-search-input"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="cn-search-clear"
                onClick={() => setSearchQuery("")}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>

          {/* Tab Content List */}
          <div className="cn-sidebar-content">
            {/* Chats Tab */}
            {activeTab === "chats" && (
              <div className="cn-list-container">
                {filteredChats.length === 0 ? (
                  <div className="cn-empty-list">
                    <i className="bi bi-chat-square-dots empty-list-icon"></i>
                    <p>{t("noChats")}</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const isSelected = selectedChat === chat.id;
                    const participant = chat.other_participant;
                    return (
                      <div
                        key={chat.id}
                        className={`cn-chat-item ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          setSelectedChat(chat.id);
                          setSelectedRecipient(null);
                        }}
                      >
                        <div className="cn-avatar-wrapper">
                          {renderAvatar(participant?.profile_pic, participant?.full_name)}
                          <span className="cn-status-indicator online"></span>
                        </div>

                        <div className="cn-item-info">
                          <div className="cn-item-header">
                            <h4 className="cn-item-name">{participant?.full_name || "Colleague"}</h4>
                            <span className="cn-item-time">
                              {formatTime(chat.last_message_at || chat.last_message?.created_at)}
                            </span>
                          </div>
                          <p className="cn-item-subtitle">
                            {chat.last_message?.body || participant?.job_title || ""}
                          </p>
                        </div>

                        {chat.unread_count > 0 && (
                          <span className="cn-unread-pill">{chat.unread_count}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === "contacts" && (
              <div className="cn-list-container">
                {filteredContacts.length === 0 ? (
                  <div className="cn-empty-list">
                    <i className="bi bi-person-x empty-list-icon"></i>
                    <p>{t("noContacts")}</p>
                  </div>
                ) : (
                  filteredContacts.map((c) => {
                    const isSelected = selectedRecipient?.user_id === c.user_id;
                    return (
                      <div
                        key={c.user_id || c.profile_id}
                        className={`cn-chat-item ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          setSelectedRecipient(c);
                          setSelectedChat(null);
                          setMessages([]);
                        }}
                      >
                        <div className="cn-avatar-wrapper">
                          {renderAvatar(c.profile_pic, c.full_name)}
                        </div>

                        <div className="cn-item-info">
                          <h4 className="cn-item-name">{c.full_name}</h4>
                          <p className="cn-item-subtitle">{c.job_title || t("onlineStatus")}</p>
                        </div>

                        <button
                          type="button"
                          className="cn-contact-chat-btn"
                          title={t("startChatWith", { name: c.full_name })}
                        >
                          <i className="bi bi-chat-fill"></i>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="cn-list-container">
                {unreadCount > 0 && (
                  <div className="cn-mark-all-bar">
                    <button type="button" className="btn-mark-all-read" onClick={markAllAsRead}>
                      <i className="bi bi-check2-all me-1"></i>
                      {t("markAllAsRead")}
                    </button>
                  </div>
                )}

                {filteredNotifications.length === 0 ? (
                  <div className="cn-empty-list">
                    <i className="bi bi-bell-slash empty-list-icon"></i>
                    <p>{t("noNotifications")}</p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`cn-notification-item ${!n.read_at ? "unread" : ""}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="cn-notif-icon-box">
                        <i
                          className={`bi ${
                            n.type === "chat_message"
                              ? "bi-chat-text-fill"
                              : n.type === "recognition_received"
                              ? "bi-award-fill"
                              : "bi-info-circle-fill"
                          }`}
                        ></i>
                      </div>

                      <div className="cn-item-info">
                        <h4 className="cn-item-name">{n.title}</h4>
                        <p className="cn-item-subtitle">{n.body}</p>
                        <span className="cn-item-time">{formatTime(n.created_at)}</span>
                      </div>

                      {!n.read_at && <span className="cn-unread-dot"></span>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="cn-chat-area">
          {activeRecipientInfo ? (
            <>
              {/* Active Chat Header */}
              <div className="cn-chat-header">
                <div className="cn-active-user-info">
                  {renderAvatar(
                    activeRecipientInfo.profile_pic,
                    activeRecipientInfo.full_name,
                    "cn-avatar-lg"
                  )}
                  <div>
                    <h3 className="cn-active-user-name">
                      {activeRecipientInfo.full_name || t("newChat")}
                    </h3>
                    <span className="cn-active-user-status">
                      <span className="cn-status-dot online"></span>
                      {activeRecipientInfo.job_title || t("onlineStatus")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="cn-messages">
                {loading ? (
                  <div className="cn-messages-loading">
                    <div className="loading-spinner" />
                    <span>{t("loading")}</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="cn-messages-empty">
                    <i className="bi bi-chat-heart cn-start-icon"></i>
                    <p>{t("startChatWith", { name: activeRecipientInfo.full_name || "" })}</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSent = Number(msg.sender_id) === Number(currentUserId);
                    return (
                      <div
                        key={msg.id}
                        className={`cn-message-row ${isSent ? "sent" : "received"}`}
                      >
                        <div className="cn-message-bubble">
                          <p className="cn-message-text">{msg.body}</p>
                          <span className="cn-message-time">
                            {formatTime(msg.created_at)}
                            {isSent && <i className="bi bi-check2-all cn-msg-status-icon"></i>}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="cn-message-input-bar">
                <input
                  type="text"
                  className="cn-message-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("typeMessage")}
                  disabled={sending}
                  autoFocus
                />

                <button
                  type="button"
                  className="btn-send-message"
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  title={t("send")}
                >
                  {sending ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="bi bi-send-fill"></i>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="cn-empty-chat">
              <div className="cn-empty-chat-content">
                <i className="bi bi-chat-left-dots empty-chat-main-icon"></i>
                <h3>{t("pageTitle")}</h3>
                <p>{t("selectChatPrompt")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;