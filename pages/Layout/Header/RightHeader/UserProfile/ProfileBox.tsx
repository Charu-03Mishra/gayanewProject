import React from 'react';
// import { profilesMessage } from "@/pages/Data/LayoutData/HeaderData";
import FeatherIcons from "@/pages/components/FeatherIcon/FeatherIcon";
import LI from "@/pages/components/ListGroup/ListItem";
import UL from "@/pages/components/ListGroup/UnorderedList";
import Link from "next/link";
import { useRouter } from "next/router";
import localStorage from '@/utils/localStorage';

interface profilesMessageType{
  name : string,
  icon : "User" | "LogOut" ,
  link : string
}
const role = localStorage.getItem("role");
const profilesMessage:profilesMessageType[] = [
  {
      name: "My Profile",
      icon:"User",
      link: role === "vendor" ? `/auth/vendorProfile` : `/auth/profile`
  },
  {
      name: "Log Out",
      icon:"LogOut",
      link:`/`
  },
];

const ProfileBox: React.FC = () => {
  const router = useRouter();
  
  const handleClick = (name:string)=>{
    if(name === "Log Out"){
      localStorage.removeItem("signIn");
      localStorage.removeItem("role");
      localStorage.removeItem("phone");
      localStorage.removeItem("vendor-phone");
      localStorage.removeItem("members_detail");
      localStorage.removeItem("memberId");
      localStorage.removeItem("vendor-details");
      router.push('/')
    }
  }
  return (
    <UL className="profile-drop-down ">
      {profilesMessage.map((data,index) => (
        <LI key={index}>
          <Link href={data.link} onClick={()=>handleClick(data.name)}>
            <FeatherIcons iconName={data.icon} /> <span>{data.name} </span>
          </Link>
        </LI>
      ))}
    </UL>
  );
};

export default ProfileBox;
