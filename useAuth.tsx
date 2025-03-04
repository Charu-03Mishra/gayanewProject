import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import localStorage from "@/utils/localStorage";

// Function to check if token has expired
const checkTokenExpire = (exp: number) => {
  return new Date() > new Date(exp * 1000);
};

const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      const userData = localStorage.getItem("signIn");
      const user = JSON.stringify(userData);
      if (user) {
        try {
          const { exp } = jwtDecode<{ exp: number }>(user); // Decode JWT token to extract expiration time
          if (!checkTokenExpire(exp)) {
            setIsAuthenticated(true); // Set isAuthenticated to true if token is not expired
          } else {
            localStorage.removeItem("signIn");
            localStorage.removeItem("role");
            localStorage.removeItem("phone");
            localStorage.removeItem("vendor-phone");
            localStorage.removeItem("members_detail");
            localStorage.removeItem("memberId");
            localStorage.removeItem("vendor-details");
            router.replace("/", undefined, { shallow: true });
          }
        } catch (error) {
          console.error("Error decoding JWT token:", error);
          console.log("User token:", user);
        }
      }
      setLoading(false);
    };

    checkAuthentication();
  }, []);

  return { isAuthenticated, loading };
};

export default useAuth;
