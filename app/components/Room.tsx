/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

interface RoomProps {
  roomId: string;
  userId: string;
  onLeaveRoom: () => void;
}

const Room: React.FC<RoomProps> = ({ roomId, userId, onLeaveRoom }) => {
  const [userCount, setUserCount] = useState<number>(0); // State for user count
  const [roomStatus, setRoomStatus] = useState<string>("waiting"); // Room status
  const [isOwner, setIsOwner] = useState<boolean>(false); // Whether the user is the owner
  const [error, setError] = useState("");
  const [nickname, setNickname] = useState("");
  const [userList, setUserList] = useState<User[]>([]); // State for user list
  const [loading, setLoading] = useState(false);
  // Fetch initial user count and user details

  const fetchRoomData = useCallback(async () => {
    try {
      setLoading(true);
      const [roomRes, countRes, usersRes] = await Promise.all([
        fetch(`/api/rooms?roomId=${roomId}`),
        fetch(`/api/room-user-count/${roomId}`),
        fetch(`/api/room-users/${roomId}`),
      ]);

      if (roomRes.status === 200) {
        const room = await roomRes.json();
        setRoomStatus(room.status);
        setIsOwner(room.host === userId); // Check if the current user is the owner
      } else {
        console.error("Failed to fetch room details");
      }

      if (countRes.status === 200) {
        const { count } = await countRes.json();
        setUserCount(count);
      } else {
        console.error("Failed to fetch user count");
      }

      if (usersRes.status === 200) {
        const res = await usersRes.json();
        setUserList(res);
        const findUser = res.find((user: any) => user.user_id === userId);
        if (findUser) {
          setNickname(findUser?.nickname);
        } else {
          setNickname("");
        }
      } else {
        console.error("Failed to fetch users");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching room data:", error);
      setLoading(false);
    }
  }, [roomId, userId]);
  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData, roomId, userId]);

  // Listen for realtime updates
  useEffect(() => {
    const subscription = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_users" },
        (payload) => {
          console.log("Realtime update:", payload);
          fetchRoomData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        (payload) => {
          console.log("Realtime update:", payload);
          fetchRoomData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchRoomData]);

  const handleLeaveRoom = async () => {
    await fetch("/api/room-users/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, userId }),
    });

    onLeaveRoom();
  };

  const handleStartGame = async () => {
    const res = await fetch("/api/rooms/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, userId }),
    });

    if (res.status === 200) {
      const { message } = await res.json();
      console.log(message);
      setRoomStatus("in_progress");
    } else {
      const { error } = await res.json();
      setError(error || "Failed to start the game");
    }
  };

  if (loading) {
    return (
      <div
        className="absolute top-0 left-0 right-0 bottom-0 bg-gray-900 text-white text-center p-4 flex items-center justify-center"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <h1 className="text-2xl font-bold">กำลังโหลด...</h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center ">
      <h1 className="text-4xl font-bold mb-6">
        สวัสดีคุณ: {nickname || "Unknown"}
      </h1>
      <h1 className="text-2xl">ไอดีห้อง: {roomId}</h1>
      <h2 className="text-2xl">
        สถานะ: {roomStatus === "waiting" ? "รอผู้เล่น" : "กําลังเริ่มเกมส์"}
      </h2>
      <h2 className="text-2xl">จํานวนผู้เล่น: {userCount} คน</h2>
      {userList.length > 0 && (
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl mb-2">รายชื่อผู้เล่นทั้งหมด</h2>
          <ul className="list-disc">
            {userList.map((user: any) => (
              <li key={user.user_id}>{user.nickname}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2">
        {isOwner && roomStatus === "waiting" && (
          <button
            onClick={handleStartGame}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            เริ่มเกมส์
          </button>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button
          onClick={handleLeaveRoom}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
        >
          ออกจากห้อง
        </button>
      </div>
    </div>
  );
};

export default Room;
