"use client";

import { useState } from "react";

interface CreateGameProps {
  userId: string;
}
const CreateGame: React.FC<CreateGameProps> = ({ userId }) => {
  const [roomDetails, setRoomDetails] = useState<{
    id: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    console.log(userId);
    setLoading(true);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: userId }), // Replace with actual user ID
    });

    const data = await res.json();
    setRoomDetails(data);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-blue-50">
      {!roomDetails ? (
        <>
          <button
            onClick={handleCreateRoom}
            className={`px-4 py-2 w-full bg-sky-500 text-white rounded hover:bg-sky-700 ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={loading}
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
              "สร้างห้อง"
            )}
          </button>
        </>
      ) : (
        <div className="text-center">
          <p>สร้างห้องสำเร็จ!</p>
          <p>ไอดีห้อง: {roomDetails.id}</p>
        </div>
      )}
    </div>
  );
};

export default CreateGame;
