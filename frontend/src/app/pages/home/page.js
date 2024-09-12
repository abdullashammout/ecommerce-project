"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button/Button";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.replace("/pages/login");
    }
  }, [router]);

  const logout = async () => {
    try {
      // Clear the token from session storage
      sessionStorage.removeItem("token");

      // Optionally, you can also make a request to the server to invalidate the refresh token
      await fetch("http://localhost:4000/logout", {
        method: "POST",
        credentials: "include", // Send cookies with request if needed
      });

      // Redirect to login page without keeping the entry in the history stack
      router.replace("/pages/login");
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <div>
      <h1>HOME SCREEN</h1>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
};

export default Home;
