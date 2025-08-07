import { useEffect, useRef, useState } from "react";
import './App.css';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface MessageResponseDto {
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'PINO';
    imageUrl?: string;
    userId?: number;
    nickname?: string;
    sentDate?: string;
}

interface MessageRequestDto {
    roomUserId: number;
    roomId: number;
    userId: number;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'PINO';
    imageUrl?: string;
    sendDate: string;
    lat?: number;         // 위도
    lng?: number;         // 경도
    timestamp?: string;   // ISO 문자열 형태 타임스탬프
}

const SOCKET_URL = "http://localhost:8080/ws-chat";

function App() {
    // == 사용자 입력 값 상태 ==
    const [roomUserId, setRoomUserId] = useState("");
    const [roomId, setRoomId] = useState("");
    const [userId, setUserId] = useState("");

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<MessageResponseDto[]>([]);
    const stompClientRef = useRef<Client | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (roomId) {
            loadChatHistory(roomId);
        }

        // 기존 구독 해제
        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
        }

        const socket = new SockJS(SOCKET_URL);
        const stompClient = new Client({
            webSocketFactory: () => socket as any,
            debug: (msg: string) => console.log("[STOMP]:", msg),
            onConnect: () => {

                console.log("[STOMP] 연결 성공: ", stompClient);
                const callback = (message: any) => {
                    if (message.body) {
                        console.log("[STOMP] 메시지 수신: ", message.body);
                        const newMessage: MessageResponseDto = JSON.parse(message.body);
                        console.log("받은 메시지 객체:", newMessage);
                        setMessages((prevMessages) => [...prevMessages, newMessage]);
                    }
                };
                stompClient.subscribe(`/topic/chat/${roomId}`, callback);
            },
            onStompError: (e) => {
                console.error("[STOMP] 연결 실패: ", e);
                stompClient.deactivate();
            },
            onDisconnect: () => console.log("STOMP 연결 해제"),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            stompClient.deactivate();
        };
    }, [roomId]);

    //채팅내역 불러오기
    const loadChatHistory = async (roomId: string) => {
        if (!roomId) return;
        try {
            const response = await fetch(`http://localhost:8080/api/chatting/${roomId}/messages`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) {
                throw new Error('채팅 내역 불러오기 실패');
            }
            const json = await response.json();

            // 백엔드 ApiResponse 구조이므로 data만 꺼내 배열 상태로 저장
            setMessages(json.data ?? []);
        } catch (error) {
            alert("채팅 내역 로딩 실패");
        }
    };


    // === ID 등 값 직접 입력용 ===

    const userInputInvalid = !roomUserId || !roomId || !userId;

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageSend(e.target.files[0]);
            e.target.value = "";
        }
    };

    const handleImageSend = async (file: File) => {
        if (userInputInvalid) {
            alert("모든 ID를 입력하세요.");
            return;
        }
        // 1. 위치 정보 가져오기 (비동기)
        if (!window.navigator.geolocation) {
            alert("이 브라우저는 위치기능을 지원하지 않습니다.");
            return;
        }

        window.navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;

                // 2. 폼데이터에 위치와 파일 동시 포함
                const formData = new FormData();
                formData.append("file", file);
                formData.append("lat", latitude.toString());
                formData.append("lng", longitude.toString());
                formData.append("timestamp", new Date().toISOString());

                const res = await fetch("http://localhost:8080/api/chatting/upload/image", { method: "POST", body: formData });
                if (!res.ok) {
                    alert("이미지 업로드 실패: " + res.status);
                    return;
                }
                // 응답 또한 ApiResponse 감싸짐 가정 시
                const apiResp = await res.json();
                const imageUrl = apiResp.data?.imageUrl ?? "";
                const chatMessage: MessageRequestDto = {
                    roomUserId: parseInt(roomUserId),
                    roomId: parseInt(roomId),
                    userId: parseInt(userId),
                    content: "이미지",
                    type: "IMAGE",
                    lat: latitude,
                    lng: longitude,
                    imageUrl,
                    sendDate: new Date().toISOString(),
                };
                stompClientRef.current?.publish({
                    destination: "/app/chat",
                    body: JSON.stringify(chatMessage),
                });
            },
            (error) => {
                alert("위치 정보를 가져올 수 없습니다: " + error.message);
            },
            { enableHighAccuracy: true }
        );
    };

    const sendMessage = () => {
        if (
            !message.trim() ||
            !stompClientRef.current ||
            !stompClientRef.current.connected
        )
            return;

        if (userInputInvalid) {
            alert("모든 ID를 입력하세요.");
            return;
        }

        const chatMessage: MessageRequestDto = {
            roomUserId: parseInt(roomUserId),
            roomId: parseInt(roomId),
            userId: parseInt(userId),
            content: message,
            type: "TEXT",
            sendDate: new Date().toISOString()
        };

        stompClientRef.current.publish({
            destination: "/app/chat",
            body: JSON.stringify(chatMessage),
        });

        setMessage("");
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div className="flex justify-center w-screen h-screen">
            <div className="flex flex-col max-w-screen-sm w-full h-full bg-neutral-50">
                {/* Header */}
                <div className="p-4 font-bold text-xl bg-neutral-200 flex justify-center">
                    Simple Chat Example
                </div>
                <button
                    className="p-2 bg-blue-300 rounded"
                    onClick={() => loadChatHistory(roomId)}
                >
                    채팅 내역 불러오기
                </button>
                {/* ID 입력창 */}
                <div className="flex gap-2 mb-4 p-4 bg-neutral-100">
                    <input
                        type="number"
                        className="p-2 rounded-lg border"
                        placeholder="RoomUser ID"
                        value={roomUserId}
                        onChange={e => setRoomUserId(e.target.value)}
                        style={{ width: 110 }}
                    />
                    <input
                        type="number"
                        className="p-2 rounded-lg border"
                        placeholder="Room ID"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        style={{ width: 90 }}
                    />
                    <input
                        type="number"
                        className="p-2 rounded-lg border"
                        placeholder="User ID"
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                        style={{ width: 90 }}
                    />
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="flex flex-col gap-1">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                style={{ maxWidth: 300 }}
                            >
                                <div className="mb-1 text-xs font-semibold text-gray-500">
                                    👤 User {message.nickname} 보낸날짜 {message.sentDate}
                                </div>
                                {message.type === "IMAGE" && message.imageUrl ? (
                                    <img src={message.imageUrl} alt="chat-img" style={{ maxWidth: 200, borderRadius: 8 }} />
                                ) : (
                                    message.content
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input + Image Upload */}
                <div className="p-4 bg-neutral-200 flex items-center w-full gap-2">
                    {/* 숨겨진 이미지 파일 input */}
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={onFileChange}
                    />

                    {/* 이미지 업로드 버튼 */}
                    <button
                        className="p-3 bg-gray-500 text-white rounded-lg"
                        onClick={() => fileInputRef.current?.click()}
                        title="사진 업로드"
                    >
                        📷
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 p-3 rounded-lg"
                        placeholder="메시지를 입력하세요..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button
                        className="p-3 bg-neutral-900 text-white rounded-lg"
                        onClick={sendMessage}
                    >
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
