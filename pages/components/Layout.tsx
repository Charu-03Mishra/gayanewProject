// "use client";
// import useAuth from "@/useAuth";
// import { useRouter } from "next/router";
// import React, { useEffect } from "react";

// const Layout = ({ children }: any) => {
//   const { isAuthenticated, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     const isTokenAvailable = localStorage.getItem("signIn");
//     if (
//       typeof window !== "undefined" &&
//       !isTokenAvailable &&
//       !isAuthenticated
//     ) {
//       router.push("/");
//     } else {
//       if (router.pathname == "/") {
//         const role = localStorage.getItem("role");
//         if (role === "admin") {
//           router.push("/dashboard", undefined ,{shallow: true});
//         } else if (role === "member" || role === null || role === "null") {
//           router.push("/comman_pages/dashboard", undefined ,{shallow: true});
//         }
//       }
//     }
//   }, [isAuthenticated]);

//   if (loading) {
//     return <div></div>;
//   }
//   return <div>{children}</div>;
// };

// export default Layout;

"use client";
import useAuth from "@/useAuth";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const Layout = ({ children }: any) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const currentPath = router.pathname;
  console.log("currentPath", currentPath);

  useEffect(() => {
    const isTokenAvailable = localStorage.getItem("signIn");
    if (
      typeof window !== "undefined" &&
      !isTokenAvailable &&
      !isAuthenticated
    ) {
      if(currentPath === "/auth/register_payment" || currentPath === "/auth/register_payment/_Payment"){
        if(currentPath === "/auth/register_payment/_Payment"){
          router.push("/auth/register_payment/_Payment");
        }else{
          router.push("/auth/register_payment/_Payment");
        }
      }else{
        router.push("/");
      }
    } else {
      if (router.pathname == "/") {
        const role = localStorage.getItem("role");
        if (role === "admin") {
          router.push("/dashboard", undefined ,{shallow: true});
        } else if (role === "member" || role === null || role === "null") {
          router.push("/comman_pages/dashboard", undefined ,{shallow: true});
        }
      }
    }
  }, [isAuthenticated]);

  if (loading) {
    return <div></div>;
  }
  return <div>{children}</div>;
};

export default Layout;
