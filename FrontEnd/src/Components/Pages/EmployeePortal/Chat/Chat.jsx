
import React, { useEffect, useState } from "react";
import apiClient from "../../../../apiConfig";
import "./Chat.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";

const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

const Chat = () => {
    const { t, i18n } = useTranslation("EmployeePortal/Chat");
    const isAr = i18n ? i18n.language === "ar" : false;

    const [chats, setChats] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const storedUser = localStorage.getItem("user");
    const currentUserId = storedUser
        ? JSON.parse(storedUser).id
        : null;
    useEffect(() => {
        fetchChats();
        fetchContacts();
        fetchNotifications();
    fetchUnreadCount();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat);
        }
    }, [selectedChat]);
const fetchNotifications = async () => {
    try {
        const response = await apiClient.get(
            "/employee/notifications"
        );

        setNotifications(response.data.data || []);
    } catch (error) {
        console.log(error);
    }
};const fetchUnreadCount = async () => {
    try {
        const response = await apiClient.get(
            "/employee/notifications/unread-count"
        );

        setUnreadCount(
            response.data.data.unread_count || 0
        );
    } catch (error) {
        console.log(error);
    }
};const markAllAsRead = async () => {
    try {
        await apiClient.post(
            "/employee/notifications/read-all"
        );

        fetchNotifications();
        fetchUnreadCount();
    } catch (error) {
        console.log(error);
    }
};const markAsRead = async (id) => {
    try {
        await apiClient.post(
            `/employee/notifications/${id}/read`
        );

        fetchNotifications();
        fetchUnreadCount();

    } catch (error) {
        console.log(error);
    }
};
const handleNotificationClick = async (
    notification
) => {
    try {

        await apiClient.post(
            `/employee/notifications/${notification.id}/read`
        );

        const notificationData =
            JSON.parse(notification.data);

        const conversationId =
            notificationData.conversation_id;

        setSelectedChat(conversationId);

        setSelectedRecipient(null);

        await fetchMessages(conversationId);

        fetchNotifications();
        fetchUnreadCount();

    } catch (error) {
        console.log(error);
    }
};
    const fetchContacts = async () => {
        try {
            const response = await apiClient.get(
                "/employee/chats/contacts"
            );
            setContacts(response.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchChats = async () => {
        try {
            const response = await apiClient.get(
                "/employee/chats"
            );

            const data = response.data.data || [];

            setChats(data);

            if (data.length > 0) {
                setSelectedChat(data[0].id);
            } else {
                setSelectedChat(null);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            setLoading(true);

            const response = await apiClient.get(
                `/employee/chats/${conversationId}/messages`
            );

            setMessages(response.data.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
  const handleSend = async () => {
    if (!message.trim()) return;

    try {
        const payload = selectedChat
            ? {
                  conversation_id: selectedChat,
                  body: message,
              }
            : {
                  recipient_id: selectedRecipient,
                  body: message,
              };
        const response = await apiClient.post(
            "/employee/chats/send",
            payload
        );
        setMessage("");
        if (!selectedChat) {
            const newConversationId =
                response.data.data.conversation_id;

            setSelectedChat(newConversationId);
            setSelectedRecipient(null);

            await fetchMessages(newConversationId);
        } else {
            await fetchMessages(selectedChat);
        }

        await fetchChats();

    } catch (error) {
        console.log(error);
    }
};
    const currentChat = chats.find(
        (chat) => chat.id === selectedChat
    );

    return (
        <div className={`cn-page ${isAr ? "rtl" : "ltr"}`}>
            <div className="cn-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <header className="cn-header">
                <h1>{t("pageTitle")}</h1>
            </header>

            <div className="cn-chat-layout">
                <div className="cn-sidebar">
                    <div className="cn-section">
                        <h3>{t("contacts")}</h3>

                        {contacts.map((c) => (
                            <div
                                key={c.user_id}
                                className={`cn-contact ${
                                    selectedRecipient === c.user_id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => {
                                    setSelectedRecipient(c.user_id);
                                    setSelectedChat(null);
                                    setMessages([]);
                                }}
                            >
                                <img
                                    className="cn-contact-avatar"
                                    src={
                                        c.profile_pic
                                            ? `${BASE_IMAGE_URL}/${c.profile_pic}`
                                            : "https://i.pravatar.cc/100"
                                    }
                                    alt={c.full_name}
                                />

                                <div className="cn-contact-info">
                                    <h4>{c.full_name}</h4>
                                    <p>{c.job_title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                
                    <hr />

                    <div className="cn-section">
                        <h3>{t("myChats")}</h3>
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`cn-chat-item ${
                                    selectedChat === chat.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => {
                                    setSelectedChat(chat.id);
                                    setSelectedRecipient(null);
                                }}
                            >
                                <img
                                    className="cn-sidebar-avatar"
                                    src={
                                        chat.other_participant?.profile_pic
                                            ? `${BASE_IMAGE_URL}/${chat.other_participant.profile_pic}`
                                            : "https://i.pravatar.cc/100"
                                    }
                                    alt={chat.other_participant?.full_name}
                                />

                                <div>
                                    <h4>{chat.other_participant?.full_name}</h4>
                                    <p>{chat.last_message?.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cn-section">
                        <h3>{t("notifications", { count: unreadCount })}</h3>

                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="cn-chat-item"
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="cn-chat-info">
                                    <h4>{notification.title}</h4>
                                    <p>{notification.body}</p>
                                </div>

                                {!notification.read_at && (
                                    <span className="cn-unread-badge">•</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cn-chat-area">
                    {currentChat || selectedRecipient ? (
                        <>
                            <div className="cn-chat-header">
                                <h3>
                                    {currentChat
                                        ? currentChat.other_participant?.full_name
                                        : t("newChat")}
                                </h3>
                            </div>
                            <div className="cn-messages">
                                {loading ? (
                                    <p>{t("loading")}</p>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`cn-message ${
                                                Number(msg.sender_id) === Number(currentUserId)
                                                    ? "sent"
                                                    : "received"
                                            }`}
                                        >
                                            <p>{msg.body}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="cn-message-input">
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t("typeMessage")}
                                />

                                <button onClick={handleSend}>
                                    {t("send")}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="cn-empty-chat">
                            <p style={{ textAlign: "center", marginTop: "30%" }}>
                                {t("selectChatPrompt")}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;