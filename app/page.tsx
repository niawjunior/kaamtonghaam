"use client";
import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import CreateGame from "./components/CreateGame";
import JoinGame from "./components/JoinGame";

export default function Home() {
  const [isLandscape, setIsLandscape] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinRoom, setJoinRoom] = useState(false);
  useEffect(() => {
    if (!isLandscape) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isLandscape]);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    // Initial check
    checkOrientation();

    // Add event listener
    window.addEventListener("resize", checkOrientation);

    // Cleanup event listener
    return () => {
      window.removeEventListener("resize", checkOrientation);
    };
  }, []);

  const getUser = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setLoading(false);

    if (user) {
      console.log(user);
      setUser(user);
      setLoading(false);
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  const handleJoinRoom = (isJoined: boolean) => {
    setJoinRoom(isJoined);
  };
  if (!isLandscape) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-center p-4">
        <h1 className="text-2xl font-bold">
          Please rotate your device to landscape mode to play KaamTongHaam!
        </h1>
      </div>
    );
  }

  const signOut = async () => {
    setUser(null);
  };

  return loading ? (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-center p-4">
      <h1 className="text-2xl font-bold">กำลังโหลด...</h1>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      {!user && (
        <div>
          <Auth onSignOut={signOut} />
        </div>
      )}

      {user && (
        <div className="absolute right-2 top-2">
          <Auth onSignOut={signOut} />
        </div>
      )}

      {user && !loading && (
        <div className="flex flex-col gap-2">
          {!joinRoom && <CreateGame userId={user.id} />}
          <JoinGame
            userId={user.id}
            email={user.email}
            onJoinRoom={handleJoinRoom}
          />
        </div>
      )}
    </div>
  );
}
