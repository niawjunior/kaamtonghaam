"use client";

import { useState } from "react";

interface CreateGameProps {
  userId: string;
}
const CreateGame: React.FC<CreateGameProps> = ({ userId }) => {
  const [roomDetails, setRoomDetails] = useState<{
    id: string;
  } | null>(null);

  const handleCreateRoom = async () => {
    console.log(userId);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: userId }), // Replace with actual user ID
    });

    const data = await res.json();
    setRoomDetails(data);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-blue-50">
      {!roomDetails ? (
        <>
          <button
            onClick={handleCreateRoom}
            className="px-4 py-2 w-full bg-sky-500 text-white rounded hover:bg-sky-700"
          >
            สร้างห้อง
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
