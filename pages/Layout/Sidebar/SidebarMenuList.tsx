import { Fragment, Key, useEffect, useState } from "react";
// import { useAppSelector } from '../../ReduxToolkit/Hooks';
import H6 from "@/pages/components/headings/H6Element";
import LI from "@/pages/components/ListGroup/ListItem";
// import { MenuItem } from '@/pages/Types/Layout/SidebarType';
import Menulist from "./Menulist";
// import MenuList from '@/pages/Data/LayoutData/SidebarData';
import axios from "axios";
// import { RootState } from "@/pages/ReduxToolkit/Store";
import { TypedUseSelectorHook } from "react-redux";
import { useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LayoutSlice from "@/ReduxToolkit/Reducers/LayoutSlice";
import localStorage from "@/utils/localStorage";

const Store = configureStore({
	reducer: {
		layout: LayoutSlice,
	},
});

type RootState = ReturnType<typeof Store.getState>;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

interface MenuItem {
	title: string;
	lanClass?: string;
	menucontent?: string;
	Items?: MenuItem[];
	id?: number;
	icon?: string;
	type?: string;
	active?: boolean;
	children?: MenuItem[];
	path?: string;
	mainTitle?: string;
	bookmark?: boolean;
}
const MenuList: MenuItem[] = [
	{
		title: "General",
		lanClass: "lan-1",
		Items: [
			{
				path: `/dashboard`,
				icon: "home",
				type: "link",
				title: "Dashboard",
				id: 0,
			},
			{
				path: `/comman_pages/dashboard`,
				icon: "home",
				type: "link",
				title: "Dashboards",
				id: 1,
			},
			{
				title: "Members",
				id: 2,
				icon: "user",
				type: "sub",
				lanClass: "lan-6",
				children: [
					{
						path: `/comman_pages/members/list_members`,
						title: "Members List",
						type: "link",
						lanClass: "lan-4",
					},
					{
						path: `/comman_pages/members/add_members`,
						title: "Add Member",
						type: "link",
					},
					{
						path: `/comman_pages/members/members_form`,
						title: "Offline Meeting Fees",
						type: "link",
					},
				],
			},
			{
				title: "Chapters",
				id: 3,
				icon: "widget",
				type: "sub",
				lanClass: "lan-6",
				active: false,
				children: [
					{
						path: `/comman_pages/chapters/add_chapters`,
						title: "Add Chapters",
						type: "link",
					},
					{
						path: `/comman_pages/chapters/list_chapter`,
						title: "Chapters List",
						type: "link",
					},
				],
			},
			{
				title: "Region",
				id: 4,
				icon: "layout",
				type: "sub",
				active: false,
				children: [
					{
						path: `/comman_pages/region/add_region`,
						title: "Add Region",
						type: "link",
					},
					{
						path: `/comman_pages/region/list_region`,
						title: "Region List",
						type: "link",
					},
				],
			},
			{
				title: "Expense",
				id: 5,
				icon: "layout",
				type: "sub",
				active: false,
				children: [
					{
						path: `/comman_pages/expense/list_expense`,
						title: "Expense List",
						type: "link",
					},
					{
						path: `/comman_pages/expense/add_expense`,
						title: "Add Expense",
						type: "link",
					},
				],
			},
			{
				title: "Payments",
				id: 6,
				icon: "layout",
				type: "sub",
				active: false,
				children: [
					{
						path: `/payments/manage_payment`,
						title: "Payment List",
						type: "link",
					},
				],
			},
			{
				title: "TDS",
				id: 7,
				icon: "layout",
				type: "sub",
				active: false,
				children: [
					{
						path: `/comman_pages/TDS/list_tds`,
						title: "TDS List",
						type: "link",
					},
					{ path: `/comman_pages/TDS/add_tds`, title: "Add TDS", type: "link" },
				],
			},
			{
				title: "Vendor Master",
				id: 8,
				icon: "layout",
				type: "sub",
				active: false,
				children: [
					{
						path: `/comman_pages/vendor_master/list_vendor`,
						title: "Vendor List",
						type: "link",
					},
					{
						path: `/comman_pages/vendor_master/add_vendor`,
						title: "Add Vendor",
						type: "link",
					},
				],
			},
			{
				title: "Kitty Balance",
				id: 12,
				icon: "layout",
				type: "sub",
				active: false,
				children: [
					{ path: `/kittybalance/`, title: "Kitty Balance", type: "link" },
					{
						path: `/kittybalance/add_kitty`,
						title: "Add Kitty Balance",
						type: "link",
					},
					{
						path: `/kittybalance/subtract_kitty`,
						title: "Subtract Kitty Balance",
						type: "link",
					},
				],
			},
			{
				title: "Reports",
				id: 9,
				icon: "layout",
				type: "sub",
				active: false,
				children: [
					{
						path: `/comman_pages/Reports/membership_renew`,
						title: "Membership Renew",
						type: "link",
					},
					{
						path: `/comman_pages/Reports/meeting_fees_payment`,
						title: "Meeting Fees Payment",
						type: "link",
					},
					{
						path: `/comman_pages/Reports/CDPS_payment`,
						title: "CDPS Payment",
						type: "link",
					},
					{
						path: `/comman_pages/Reports/visitor_payment`,
						title: "Visitor Payment",
						type: "link",
					},
					{
						path: `/comman_pages/Reports/pending_payment`,
						title: "Pending Payment",
						type: "link",
					},
					{
						path: `/comman_pages/Reports/chapters_pending_payment`,
						title: "Chapter Pending Payment",
						type: "link",
					},
					{
						path: `/comman_pages/Reports/cheque_payment`,
						title: "Cheque Payment",
						type: "link",
					},
					{
						path: `/comman_pages/Reports/all_transactions`,
						title: "All Transactions Report",
						type: "link",
					},
				],
			},
			{
				title: "Training List",
				id: 10,
				icon: "layout",
				type: "sub",
				active: false,
				children: [
					{
						path: `/training/list_training`,
						title: "Training List",
						type: "link",
					},
				],
			},
			{
				title: "Report",
				id: 11,
				icon: "layout",
				type: "sub",
				active: false,
				children: [
					{
						path: `/comman_pages/Reports/pending_payment`,
						title: "Pending Payment",
						type: "link",
					},
					{
						path: `/comman_pages/Reports/all_transactions`,
						title: "All Transactions Report",
						type: "link",
					},
				],
			},
		],
	},
];
const SidebarMenuList = () => {
	const [activeMenu, setActiveMenu] = useState<string[]>([]);
	const { pinedMenu } = useAppSelector<any>((state) => state.layout);
	const role = localStorage.getItem("role");
	const memberDetail = JSON.parse(localStorage.getItem("members_detail"));

	const shouldHideMenu = (mainMenu: any) => {
		// If user's role is admin, show all menu items
		if (role === "admin") {
			const allowedItems = ["Payments", "Dashboards", "Report"];
			const filteredItems = mainMenu?.Items?.filter(
				(item: any) => !allowedItems.includes(item.title)
			);
			return filteredItems;
		} else if (memberDetail && memberDetail?.permission_LT !== null) {
			const allowedItems = [
				"Dashboards",
				"Report",
				"Expense",
				"Payments",
				"TDS",
			];
			const hasAllowedItem = mainMenu?.Items?.filter((item: any) =>
				allowedItems.includes(item.title)
			);
			return hasAllowedItem;
		} else if (role === "member") {
			const allowedItems = ["Dashboards", "Payments", "TDS"];
			const hasAllowedItem = mainMenu?.Items?.filter((item: any) =>
				allowedItems.includes(item.title)
			);
			return hasAllowedItem;
		} else if (memberDetail && memberDetail?.permission_SGDC !== null) {
			const allowedItems = ["Dashboards", "Report", "Payments", "TDS"];
			const hasAllowedItem = mainMenu?.Items?.filter((item: any) =>
				allowedItems.includes(item.title)
			);
			return hasAllowedItem;
		} else if (role === "vendor") {
			const allowedItems = ["Expense"];
			const hasAllowedItem = mainMenu?.Items?.filter((item: any) =>
				allowedItems.includes(item.title)
			);
			return hasAllowedItem;
		}
		// else {
		//   const menuTitles = mainMenu?.Items?.map((data: { title: any }) => data.title) || [];
		//   return menuTitles.every((title: string) => pinedMenu.includes(title));
		// }
	};

	// const shouldHideMenu = (mainMenu: MenuItem) => {return mainMenu?.Items?.map((data) => data.title).every((titles) =>pinedMenu.includes(titles || ""));};
	return (
		<>
			{MenuList &&
				MenuList.map((mainMenu: MenuItem, index) => (
					<Fragment key={index}>
						<LI
							className={`sidebar-main-title ${
								shouldHideMenu(mainMenu) ? "d-none" : ""
							}`}>
							<div>
								<H6 className={mainMenu.lanClass && mainMenu.lanClass}>
									{mainMenu.title}
								</H6>
							</div>
						</LI>
						<Menulist
							menu={shouldHideMenu(mainMenu)}
							activeMenu={activeMenu}
							setActiveMenu={setActiveMenu}
							level={0}
						/>
					</Fragment>
				))}
		</>
	);
};

export default SidebarMenuList;

