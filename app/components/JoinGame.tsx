"use client";

import { useState } from "react";
import Room from "./Room";

interface JoinGameProps {
  userId: string;
  email?: string;
  onJoinRoom: (isJoined: boolean) => void;
}

const JoinGame: React.FC<JoinGameProps> = ({ userId, onJoinRoom }) => {
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  const handleJoinRoom = async () => {
    setLoading(true);
    const res = await fetch("/api/room-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, userId, nickname }),
    });

    if (res.status === 200) {
      setSuccess(true);
      setError("");
      setShowModal(false); // Close modal on success
      onJoinRoom(true);
      setLoading(false);
    } else {
      const { error } = await res.json();
      setError(error || "Failed to join room");
      setSuccess(false);
      setLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setRoomId("");
    setNickname("");
  };
  const onLeaveRoom = () => {
    setSuccess(false);
    onJoinRoom(false);
  };
  return (
    <div className="flex flex-col items-center justify-center">
      {!success ? (
        <>
          {/* Button to open modal */}
          <button
            onClick={() => openModal()}
            className="px-4 w-full py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            เข้าร่วมเกมส์
          </button>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-xl font-bold mb-4">กรอกไอดีห้อง</h2>
                <input
                  type="text"
                  placeholder="ไอดีห้อง"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="mb-4 p-2 border rounded w-full"
                />
                <input
                  type="text"
                  placeholder="ชื่อเล่น"
                  className="mb-4 p-2 border rounded w-full"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(false)} // Close modal
                    className="px-4 py-2 bg-gray-300 w-full rounded hover:bg-gray-400"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    className={`px-4 py-2 bg-green-500 w-full text-white rounded hover:bg-green-700 ${
                      loading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                    ) : (
                      "เข้าร่วมเกมส์"
                    )}
                  </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <Room
            roomId={roomId}
            userId={userId}
            onLeaveRoom={() => onLeaveRoom()}
          />
        </>
      )}
    </div>
  );
};

export default JoinGame;
