import ProfileBox from "./ProfileBox";
import P from "@/pages/components/Paragraph";
import LI from "@/pages/components/ListGroup/ListItem";
import Image from "@/pages/components/media";
import { useEffect, useState } from "react";
import axios from "axios";
import localStorage from "@/utils/localStorage";

const UserProfile: React.FC = () => {
	// const [userData, setUserData] = useState<any>(null);
	const role = localStorage.getItem("role");
	const vendorDetails = JSON.parse(localStorage.getItem("vendor-details"));
	const memberDetails = JSON.parse(localStorage.getItem("members_detail"));
	const [dropdwon, sedropdown] = useState<boolean>(false);
	const dropdwonHandler = () => {
		sedropdown(!dropdwon);
	};

	// useEffect(() => {
	//   const fetchUserData = async () => {
	//     try {
	//       const response = await axios.get("/api/profile", {
	//         headers: {
	//           Authorization: `Bearer ${localStorage.getItem("signIn")}`,
	//         },
	//       });
	//       setUserData(response.data?.user);
	//     } catch (error) {
	//       console.error("Error fetching user data:", error);
	//     }
	//   };

	//   fetchUserData();
	// }, []);
	return (
		<LI className="profile-nav onhover-dropdown px-0 py-0 ">
			<div
				className="d-flex profile-media align-items-center "
				onClick={dropdwonHandler}>
				<Image
					className="img-30"
					src="/assets/images/dashboard/profile.png"
					alt="user"
				/>
				<div className="flex-grow-1">
					{role === "vendor" ? (
						<P className="mb-0 font-outfit">
							{vendorDetails?.name} {""}
							{/* <i className="fa fa-angle-down" /> */}
						</P>
					) : (
						<P className="mb-0 font-outfit">
							{memberDetails?.first_name} {memberDetails?.last_name} {""}
							{/* <i className="fa fa-angle-down" /> */}
						</P>
					)}
				</div>
			</div>
			{dropdwon && (
				<div className="proflie-dropdown">
					<ProfileBox />
				</div>
			)}
		</LI>
	);
};

export default UserProfile;

