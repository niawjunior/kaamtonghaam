"use client";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface AuthProps {
  onSignOut?: () => void;
}
const Auth: React.FC<AuthProps> = ({ onSignOut }) => {
  const [user, setUser] = useState<User | null>(null);
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Error signing in:", error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    onSignOut?.();
    if (error) console.error("Error signing out:", error.message);
  };

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUser(user);
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  return (
    <div>
      {user ? (
        <button
          onClick={signOut}
          className="px-6 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition"
        >
          ออกจากระบบ
        </button>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
        >
          เข้าสู่ระบบด้วย google
        </button>
      )}
    </div>
  );
};

export default Auth;
