import Layout from "@/pages/Layout/Layout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	Card,
	CardBody,
	CardFooter,
	Col,
	FormGroup,
	Label,
	Row,
} from "reactstrap";
import moment from "moment";
import Btn from "@/pages/components/button";
import { useRouter } from "next/router";
import KittyBalaceAPI from "@/pages/kitty-balance/kittyBalace";
import MembershipRenewal from "@/pages/payments/membership_renewal";
import CommonCardHeader from "@/pages/components/CommonCardHeader/CommonCardHeader";
import H5 from "@/pages/components/headings/H5Element";
import { toast } from "react-toastify";
import { Form, Formik } from "formik";
import { generateInvoiceNumber } from "@/utils/utils";
import WhatsappPop from "@/pages/components/WhatsappPop/WhatsappPop";

const Index = () => {
	const router = useRouter();
	const [userData, setUserData] = useState(null);
	const [chaptersData, setChaptersData] = useState([]);
	const [startDate, setStartDate] = useState();
	const [endDate, setEndDate] = useState();
	const [tillStartDate, setTillStartDate] = useState();
	const [tillEndDate, setTillEndDate] = useState();
	const [monthlyStartDate, setMonthlyStartDate] = useState();
	const [monthlyEndDate, setMonthlyEndDate] = useState();
	const [totalWeeks, setTotalWeeks] = useState();
	const [monthlyTotalWeeks, setMonthlyTotalWeeks] = useState();
	const [subscription, setSubscription] = useState();
	const [cgst, setCGST] = useState(0);
	const [sgst, setSGST] = useState(0);
	const [totalAmount, setTotalAmount] = useState(0);
	const [discount, setDiscount] = useState(0);
	const [tillDisAmount, setTillDisAmount] = useState(0);
	const [subTotalAmount, setSubTotalAmount] = useState(0);
	const [tillAmount, setTillAmount] = useState(0);
	const [finalAmount, setFinalAmount] = useState(0);
	const [verificationCode, setVerificationCode] = useState("");
	const [selectedOption, setSelectedOption] = useState(null);
	const [selectMonth, setSelectMonth] = useState("1_month");
	const [pendingMonth, setPendingMonth] = useState(0);
	const memberDetail = JSON.parse(localStorage.getItem("members_detail"));

	const calculatePendingMonths = (date1, date2) => {
		const start = new Date(date1);
		const end = new Date(date2);

		const startYear = start.getFullYear();
		const startMonth = start.getMonth();
		const endYear = end.getFullYear();
		const endMonth = end.getMonth();

		// Calculate total months, including both start and end months
		const totalMonths =
			(endYear - startYear) * 12 + (endMonth - startMonth) + 1;

		// Exclude the current month (start month)
		const pendingMonths = totalMonths - 1;

		return Math.max(pendingMonths, 0);
	};

	const calculateTotalWeeks = (date1, date2, meetingDay) => {
		// const startMillis = date1.getTime();
		// const endMillis = date2.getTime();

		// // Calculate the difference in milliseconds
		// const difference = Math.abs(endMillis - startMillis);

		// // Convert milliseconds to weeks
		// const weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7));

		// return weeks;
		console.log("meetingDay", meetingDay);

		let count = 0;
		let current = new Date(date1);
		let end = new Date(date2);
		console.log("current", current);
		console.log("end", end);
		const dayOfWeekMap = {
			sunday: 0,
			monday: 1,
			tuesday: 2,
			wednesday: 3,
			thursday: 4,
			friday: 5,
			saturday: 6,
		};
		const meetingDayNumber = dayOfWeekMap[meetingDay?.toLowerCase()];

		while (current <= end) {
			if (current.getDay() === meetingDayNumber) {
				count++;
			}
			current.setDate(current.getDate() + 1);
		}
		console.log("count", count);
		return count;
	};

	function countTotalDays(start, end, meetingDay) {
		let count = 0;
		let current = new Date(start);

		// Force time to midnight for start
		current.setHours(0, 0, 0, 0);

		// Extend end date to the end of the day (23:59:59) to avoid missing it
		end.setHours(23, 59, 59, 999);

		const dayOfWeekMap = {
			sunday: 0,
			monday: 1,
			tuesday: 2,
			wednesday: 3,
			thursday: 4,
			friday: 5,
			saturday: 6,
		};
		const meetingDayNumber = dayOfWeekMap[meetingDay.toLowerCase()];

		while (current <= end) {
			if (current.getDay() === meetingDayNumber) {
				count++;
			}
			current.setDate(current.getDate() + 1);
		}
		return count;
	}

	function getLastDayOfMonth(date) {
		// Create a new Date object for the first day of the next month
		// const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

		// // Subtract one day to get the last day of the current month
		// const lastDay = new Date(nextMonth - 1);

		// return lastDay;
		return new Date(date.getFullYear(), date.getMonth() + 1, 0);
	}

	/*  payment terms*/
	const calculateAmountBasedOnPaymentTerm = (paymentTerm) => {
		const outstanding = parseInt(userData.outstanding_balance);
		console.log("outstanding", outstanding);
		const latFees = pendingMonth * 100;
		console.log("latFees", latFees);
		let amount = latFees + 0;
		if (outstanding > 0) {
			amount += outstanding;
		}
		console.log("amount", amount);
		let cgstAmount = 0;
		let sgstAmount = 0;
		let total = 0;
		if (outstanding < 0) {
			total += outstanding;
		}
		console.log("total", total);

		// Declare startDates and currentDate once at the beginning of the function
		const startDates = new Date(userData?.mf_end_date);
		startDates.setDate(startDates.getDate() + 1);
		const currentDate = new Date();
		console.log("userDatauserDatauserData", userData);

		// Define endDates variable
		let endDates;
		switch (paymentTerm) {
			case "1_month":
				setSelectMonth("1_month");
				const lastDateOfMonth = new Date(
					currentDate.getFullYear(),
					currentDate.getMonth() + 1,
					0
				);
				endDates = lastDateOfMonth;
				console.log("endDates", endDates);
				if (
					startDates >=
					new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
				) {
					console.log(`in`);
					const endDates2 = new Date(startDates);
					endDates2.setMonth(startDates.getMonth());
					const lastDayOfMonth = getLastDayOfMonth(startDates);
					// const lastDayOfMonth = new Date(endDates2 - 1);
					console.log(lastDayOfMonth);
					setMonthlyStartDate(moment(startDates).format("YYYY-MM-DD"));
					setMonthlyEndDate(moment(lastDayOfMonth).format("YYYY-MM-DD"));
					const meetingDaysCount = countTotalDays(
						startDates,
						lastDayOfMonth,
						chaptersData.meeting_day
					);
					setMonthlyTotalWeeks(meetingDaysCount);
					amount +=
						meetingDaysCount * Number(chaptersData?.weekly_meeting_fees);
					// Calculate the GST amount
					cgstAmount = amount * 0.09;
					sgstAmount = amount * 0.09;
					total += amount + cgstAmount + sgstAmount;

					setSubTotalAmount(amount);
					setCGST(cgstAmount);
					setSGST(sgstAmount);
					setTotalAmount(total);
				} else if (startDates <= currentDate) {
					setMonthlyStartDate(moment(startDates).format("YYYY-MM-DD"));
					setMonthlyEndDate(moment(endDates).format("YYYY-MM-DD"));
					const meetingDaysCount = countTotalDays(
						startDates,
						endDates,
						chaptersData.meeting_day
					);
					setMonthlyTotalWeeks(meetingDaysCount);
					amount +=
						meetingDaysCount * Number(chaptersData?.weekly_meeting_fees); // original amount

					// Calculate the GST amount
					cgstAmount = amount * 0.09;
					sgstAmount = amount * 0.09;
					total += amount + cgstAmount + sgstAmount;

					setSubTotalAmount(amount);
					setCGST(cgstAmount);
					setSGST(sgstAmount);
					setTotalAmount(total);
				} else {
				}
				break;
			case "6_month":
				setSelectMonth("6_month");
				// Create a new Date object for the end date
				endDates = new Date(startDates);

				// Add 6 months to the start date to get the end date
				endDates.setMonth(endDates.getMonth() + 5);
				endDates = new Date(endDates);
				endDates = getLastDayOfMonth(endDates);

				if (
					startDates >=
					new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
				) {
					console.log("greater");

					setMonthlyStartDate(moment(startDates).format("YYYY-MM-DD"));
					setMonthlyEndDate(moment(endDates).format("YYYY-MM-DD"));
					const noofweeks = calculateTotalWeeks(
						startDates,
						endDates,
						chaptersData.meeting_day
					);
					setMonthlyTotalWeeks(noofweeks);
					amount += noofweeks * Number(chaptersData?.weekly_meeting_fees);
					console.log("amount", amount);

					const disc = 0.04 * amount;
					console.log("disc", disc);

					setDiscount(disc);
					const disAmountTotal = amount - disc;
					// amount = amount - disc;
					// Calculate the GST amount
					cgstAmount = disAmountTotal * 0.09;
					sgstAmount = disAmountTotal * 0.09;
					total += disAmountTotal + cgstAmount + sgstAmount;

					setSubTotalAmount(amount);
					setCGST(cgstAmount);
					setSGST(sgstAmount);
					setTotalAmount(total);
				} else if (startDates <= currentDate) {
					console.log("less");
					setMonthlyStartDate(moment(startDates).format("YYYY-MM-DD"));
					setMonthlyEndDate(moment(endDates).format("YYYY-MM-DD"));
					const noofweeks = calculateTotalWeeks(
						startDates,
						endDates,
						chaptersData.meeting_day
					);
					setMonthlyTotalWeeks(noofweeks);
					amount += noofweeks * Number(chaptersData?.weekly_meeting_fees); // original amount

					// Calculate the GST amount
					cgstAmount = amount * 0.09;
					sgstAmount = amount * 0.09;
					total += amount + cgstAmount + sgstAmount;

					setSubTotalAmount(amount);
					setCGST(cgstAmount);
					setSGST(sgstAmount);
					setTotalAmount(total);
				} else {
				}
				break;
			case "12_month":
				setSelectMonth("12_month");
				// Calculate amounts for 12 months
				// Update subTotal, cgst, sgst, and totalAmount
				// Create a new Date object for the end date

				endDates = new Date(startDates);

				// Add 6 months to the start date to get the end date
				endDates.setMonth(endDates.getMonth() + 12);
				endDates = new Date(endDates - 1);

				if (
					startDates >=
					new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
				) {
					setMonthlyStartDate(moment(startDates).format("YYYY-MM-DD"));
					setMonthlyEndDate(moment(endDates).format("YYYY-MM-DD"));
					const noofweeks = calculateTotalWeeks(
						startDates,
						endDates,
						chaptersData.meeting_day
					);
					setMonthlyTotalWeeks(noofweeks);
					amount += noofweeks * Number(chaptersData?.weekly_meeting_fees);
					const disc = 0.12 * amount;
					setDiscount(disc);
					// amount = amount - disc;
					const disAmountTotal = amount - disc;
					// Calculate the GST amount
					cgstAmount = disAmountTotal * 0.09;
					sgstAmount = disAmountTotal * 0.09;
					total += disAmountTotal + cgstAmount + sgstAmount;

					setSubTotalAmount(amount);
					setCGST(cgstAmount);
					setSGST(sgstAmount);
					setTotalAmount(total);
				} else if (startDates <= currentDate) {
					setMonthlyStartDate(moment(startDates).format("YYYY-MM-DD"));
					setMonthlyEndDate(moment(endDates).format("YYYY-MM-DD"));
					const noofweeks = calculateTotalWeeks(
						startDates,
						endDates,
						chaptersData.meeting_day
					);
					setMonthlyTotalWeeks(noofweeks);
					amount += noofweeks * Number(chaptersData?.weekly_meeting_fees); // original amount

					// Calculate the GST amount
					cgstAmount = amount * 0.09;
					sgstAmount = amount * 0.09;
					total += amount + cgstAmount + sgstAmount;

					setSubTotalAmount(amount);
					setCGST(cgstAmount);
					setSGST(sgstAmount);
					setTotalAmount(total);
				} else {
				}
				break;
			// Add more cases as needed
			default:
				setSubTotalAmount(amount);
				setCGST(cgstAmount);
				setSGST(sgstAmount);
				setTotalAmount(total);
				break;
		}
	};

	useEffect(() => {
		if (selectedOption === "yearly") {
			calculateAmountBasedOnPaymentTerm("12_month");
			// const amount = 52 * Number(chaptersData?.weekly_meeting_fees); // original amount
			// const discount = 0.12; // 12% discount

			// // Calculate the discounted amount
			// const countdiscount = amount * discount;
			// const discountedAmount = amount - amount * discount;
			// // Calculate the GST amount
			// const cgstAmount = discountedAmount * 0.09;
			// const sgstAmount = discountedAmount * 0.09;
			// const total = discountedAmount + cgstAmount + sgstAmount;

			// setDiscount(countdiscount);
			// setSubTotalAmount(amount);
			// setCGST(cgstAmount);
			// setSGST(sgstAmount);
			// setTotalAmount(total);
		} else if (selectedOption === "tillRenewal") {
			const startDates = userData?.mf_end_date
				? new Date(userData?.mf_end_date)
				: new Date(userData?.manual_induction);

			startDates.setDate(startDates.getDate() + 1);
			const endDates = new Date(userData?.membership_end_date);

			// Subtract one day (in milliseconds)
			endDates.setDate(endDates.getDate() - 1);

			const tillMeetingDaysCount = countTotalDays(
				startDates,
				endDates,
				chaptersData.meeting_day
			);

			const startFormattedDate = moment(startDates).format("YYYY-MM-DD");
			setTillStartDate(startFormattedDate);
			const endFormattedDate = moment(endDates).format("YYYY-MM-DD");
			setTillEndDate(endFormattedDate);

			setTotalWeeks(tillMeetingDaysCount);
			const lateFee = pendingMonth * 100;
			let amount = lateFee + 0;
			amount +=
				Number(chaptersData?.weekly_meeting_fees) * tillMeetingDaysCount;
			setTillAmount(amount);
			// Calculate the discounted final amount
			const noofmonths = calculateTotalMonthsBetweenDates(
				startFormattedDate,
				endFormattedDate
			);
			const finalAmountInPaise = calculateDiscountedAmount(
				noofmonths,
				amount,
				startDates
			);
			const cgstAmount = finalAmountInPaise * 0.09;
			const sgstAmount = finalAmountInPaise * 0.09;

			setSubTotalAmount(amount);
			setCGST(cgstAmount);
			setSGST(sgstAmount);
			let totalAmount = finalAmountInPaise + cgstAmount + sgstAmount;
			const outstanding = parseInt(userData.outstanding_balance);
			totalAmount += outstanding;
			setFinalAmount(totalAmount);
		} else if (selectedOption === "payOneMonthly") {
			console.log("pendingMonth", pendingMonth);

			calculateAmountBasedOnPaymentTerm("1_month");
		} else if (selectedOption === "paySixMonthly") {
			calculateAmountBasedOnPaymentTerm("6_month");
		}
	}, [pendingMonth, selectedOption]);

	const handleOptionSelection = (option) => {
		const membershipEndDate = new Date(userData?.mf_end_date); // Membership end date

		// Set the current date to the last day of the previous month
		const currentDate = new Date(); // Current date
		currentDate.setDate(0); // Set to the last day of the previous month

		// Calculate the total number of meeting days between mf_end_date and the end of the previous month
		const totalMeetingDays = calculateTotalWeeks(
			membershipEndDate,
			currentDate,
			chaptersData.meeting_day
		);
		console.log("totalMeetingDays", totalMeetingDays);

		console.log(
			"Total meeting days between mf_end_date and end of the previous month:",
			totalMeetingDays
		);

		// Set the pending months to the total number of meeting days
		const totalPendingMonth = calculatePendingMonths(
			membershipEndDate,
			currentDate
		);
		setPendingMonth(totalMeetingDays);
		console.log("Pending months: ", totalMeetingDays);
		// setPendingMonth(pendingMonths);

		setSelectedOption(option);
		// if (option === "yearly") {
		//   calculateAmountBasedOnPaymentTerm("12_month");
		//   // const amount = 52 * Number(chaptersData?.weekly_meeting_fees); // original amount
		//   // const discount = 0.12; // 12% discount

		//   // // Calculate the discounted amount
		//   // const countdiscount = amount * discount;
		//   // const discountedAmount = amount - amount * discount;
		//   // // Calculate the GST amount
		//   // const cgstAmount = discountedAmount * 0.09;
		//   // const sgstAmount = discountedAmount * 0.09;
		//   // const total = discountedAmount + cgstAmount + sgstAmount;

		//   // setDiscount(countdiscount);
		//   // setSubTotalAmount(amount);
		//   // setCGST(cgstAmount);
		//   // setSGST(sgstAmount);
		//   // setTotalAmount(total);
		// } else if (option === "tillRenewal") {
		//   const startDates = userData?.mf_end_date
		//     ? new Date(userData?.mf_end_date)
		//     : new Date(userData?.manual_induction);

		//   startDates.setDate(startDates.getDate() + 1);
		//   const endDates = new Date(userData?.membership_end_date);

		//   // Subtract one day (in milliseconds)
		//   endDates.setDate(endDates.getDate() - 1);

		//   const tillMeetingDaysCount = countTotalDays(startDates, endDates, chaptersData.meeting_day);

		//   const startFormattedDate = moment(startDates).format("YYYY-MM-DD");
		//   setTillStartDate(startFormattedDate);
		//   const endFormattedDate = moment(endDates).format("YYYY-MM-DD");
		//   setTillEndDate(endFormattedDate);

		//   setTotalWeeks(tillMeetingDaysCount);
		//   const lateFee = pendingMonth * 100;
		//   let amount = lateFee + 0
		//   amount += Number(chaptersData?.weekly_meeting_fees) * tillMeetingDaysCount;
		//   setTillAmount(amount);
		//   // Calculate the discounted final amount
		//   const finalAmountInPaise = calculateDiscountedAmount(
		//     tillMeetingDaysCount,
		//     amount,
		//     startDates
		//   );
		//   const cgstAmount = finalAmountInPaise * 0.09;
		//   const sgstAmount = finalAmountInPaise * 0.09;

		//   setSubTotalAmount(amount);
		//   setCGST(cgstAmount);
		//   setSGST(sgstAmount);
		//   const totalAmount = finalAmountInPaise + cgstAmount + sgstAmount;
		//   setFinalAmount(totalAmount);
		// } else if (option === "payOneMonthly") {
		//   console.log("pendingMonth", pendingMonth);

		//   calculateAmountBasedOnPaymentTerm("1_month");
		// } else if (option === "paySixMonthly") {
		//   calculateAmountBasedOnPaymentTerm("6_month");
		// }
	};

	const chapterFetchData = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("signIn")}`,
				},
			};

			try {
				const response = await axios.get("/api/chapters", config);
				const chapter = response.data?.find(
					(chapter) => chapter.id === userData?.chapter_id
				);
				setChaptersData(chapter);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
			}
		}
	};

	const handleSubscriptionPayment = async () => {
		const res = await initializeRazorpay();

		if (!res) {
			alert("Razorpay SDK Failed to load");
			return;
		}

		try {
			// Get the current date in milliseconds
			const currentTimestampInMilliseconds = Date.now();
			const timestampInSeconds = Math.floor(
				currentTimestampInMilliseconds / 1000
			);
			const startAt = timestampInSeconds + 15 * 60;
			const endAt = memberDetail.membership_end_date;

			// calculating if any pending payment
			const startDates = userData?.mf_end_date
				? new Date(userData?.mf_end_date)
				: new Date(userData?.manual_induction);

			const endDates = new Date(endAt);

			const differenceInMilliseconds = Math.abs(new Date() - startDates);
			const startFormattedDate = moment(startDates).format("YYYY-MM-DD");
			const endFormattedDate = moment(endDates).format("YYYY-MM-DD");
			// Convert the difference from milliseconds to weeks
			const differenceInWeeks = Math.floor(
				differenceInMilliseconds / (1000 * 60 * 60 * 24 * 7)
			);

			// Round up to the nearest whole number
			const weeksCount = Math.floor(differenceInWeeks);
			const amount = 944 * weeksCount;
			const totalAmount = amount * 100;
			const noofmonths = calculateTotalMonthsBetweenDates(new Date(), endAt);

			const resSub = await axios.post("/api/create-subscriptions", {
				// customer_id: customerData?.data?.id,
				start_at: startAt,
				expire_by: endAt,
				total_count: noofmonths,
				advance: totalAmount,
			});
			setSubscription(resSub?.data);
			if (resSub?.data?.status === "created") {
				const options = {
					key: "rzp_test_fs1Cph1IswWFtY",
					subscription_id: resSub?.data?.id,
					description: "Monthly subscription",
					image: "/assets/images/logo/bni_surat_logo.png",
					handler: async function (response) {
						// if (response.razorpay_payment_id) {
						//   await axios.put(
						//     `/api/members/${userData?.id}`,
						//     {
						//       mf_start_date: new Date(startAt * 1000),
						//       mf_end_date: new Date(endAt * 1000),
						//     },
						//     {
						//       headers: {
						//         Authorization: `Bearer ${localStorage.getItem("signIn")}`,
						//       },
						//     }
						//   );
						// }
					},
				};
				const paymentObject = new window.Razorpay(options);
				paymentObject.open();
			}
		} catch (error) {
			console.error("error", error);
		}
	};

	const initializeRazorpay = () => {
		return new Promise((resolve) => {
			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";

			script.onload = () => {
				resolve(true);
			};
			script.onerror = () => {
				resolve(false);
			};

			document.body.appendChild(script);
		});
	};

	function calculateTotalMonthsBetweenDates(date1, date2) {
		// Parse the dates
		const startDate = new Date(date1);
		const endDate = new Date(date2);

		// Calculate year and month differences
		const yearsDifference = endDate.getFullYear() - startDate.getFullYear();
		const monthsDifference = endDate.getMonth() - startDate.getMonth();

		// Calculate total months
		const totalMonths = yearsDifference * 12 + monthsDifference;

		// Return the total months
		return totalMonths;
	}

	// Function to calculate the discounted amount
	function calculateDiscountedAmount(noofmonths, finalAmountInPaise, date) {
		// Initialize discount percentage
		let discountPercentage = 0;
		// Determine if the start date (mf_end_date) is in the current month or future
		const currentDate = new Date();
		const isFutureDate = date >= currentDate;
		// Apply discount only if mf_end_date is in the current month or future
		if (isFutureDate) {
			if (noofmonths >= 6 && noofmonths <= 12) {
				// Calculate the discount percentage as (noofmonths - 5) * 1%
				// This gives 6% discount for 6 months and 12% discount for 12 months
				discountPercentage = 4;
			} else if (noofmonths >= 12) {
				discountPercentage = 12;
			} else {
				discountPercentage = 0;
			}
		}

		// Calculate the discount amount in paise
		const discountAmount = (discountPercentage / 100) * finalAmountInPaise;
		setTillDisAmount(discountAmount);
		// Calculate the discounted final amount by subtracting the discount amount from the original final amount
		const discountedFinalAmount = Math.round(
			finalAmountInPaise - discountAmount
		);

		return discountedFinalAmount;
	}

	const handleYearlyOnlinePayment = async () => {
		const res = await initializeRazorpay();

		if (!res) {
			alert("Razorpay SDK Failed to load");
			return;
		}

		const finalAmountInPaise = totalAmount.toFixed(2) * 100;
		const startFormattedDate = moment(startDate * 1000).format("YYYY-MM-DD");
		const endFormattedDate = moment(endDate * 1000).format("YYYY-MM-DD");
		const resOrder = await axios.post("/api/create-order", {
			amount: finalAmountInPaise,
			currency: "INR",
			start_at: startDate,
			end_at: endDate,
			penalty_fees: pendingMonth * 100,
			outstanding_balance: userData.outstanding_balance,
		});

		const options = {
			key: process.env.RAZORPAY_KEY,
			name: userData?.company_name,
			currency: resOrder.data?.currency,
			amount: resOrder.data?.amount,
			order_id: resOrder.data?.id,
			description: "Meeting Fees Payment",
			prefill: {
				name: `${userData?.first_name} ${userData?.last_name}`,
				email: userData?.email,
				contact: userData?.primary_number,
			},
			image: "/assets/images/logo/bni_surat_logo.png",
			handler: async function (response) {
				if (response.razorpay_payment_id) {
					const responsePayment = await axios.get(
						`/api/payment/${response.razorpay_payment_id}`,
						{
							headers: {
								Authorization: `Bearer ${localStorage.getItem("signIn")}`,
							},
						}
					);

					//update membership status
					await axios.put(
						`/api/members/${userData?.id}`,
						{
							membership_id: userData?.membership_id,
							bni_membership_id: userData?.bni_membership_id,
							title: userData?.title,
							first_name: userData?.first_name,
							last_name: userData?.last_name,
							company_name: userData?.company_name,
							gst_no: userData?.gst_no,
							role: userData?.role,
							profession: userData?.profession,
							speciality: userData?.speciality,
							chapter_id: userData?.chapter_id,
							primary_number: userData?.primary_number,
							email: userData?.email,
							mf_start_date: startFormattedDate,
							mf_end_date: endFormattedDate,
							membership_start_date: userData?.membership_start_date,
							membership_end_date: userData?.membership_end_date,
							manual_induction: userData?.manual_induction,
							membership_status: "Active",
						},
						{
							headers: {
								Authorization: `Bearer ${localStorage.getItem("signIn")}`,
							},
						}
					);
					if (responsePayment?.status === 200) {
						const payment_type = "MEETING FEES";
						await KittyBalaceAPI(
							startFormattedDate,
							endFormattedDate,
							userData?.chapter_id,
							userData?.first_name,
							userData?.last_name,
							payment_type,
							Number(chaptersData?.weekly_meeting_fees)
						);

						try {
							const resPayment = await axios.post("/api/rzp_payments", {
								member_id: userData?.id,
								chapter_id: userData?.chapter_id,
								payment_id: response.razorpay_payment_id,
								payment_type: "meeting fees",
								entity: responsePayment.data?.entity,
								amount: totalAmount.toFixed(2),
								currency: responsePayment.data?.currency,
								status: responsePayment.data?.status,
								mode: "online",
								order_id: response.razorpay_order_id,
								invoice_no: await generateInvoiceNumber(),
								email: memberDetail?.email,
								contact: memberDetail?.primary_number,
								start_payment_date: startFormattedDate,
								end_payment_date: endFormattedDate,
								penalty_fees: pendingMonth * 100,
								outstanding_balance: userData.outstanding_balance,
							});
							if (resPayment.status === 200) {
								router.push("/payments/manage_payment");
							}
						} catch (err) {
							console.error("payment error", err);
						}
					}
				}
			},
		};
		const paymentObject = new window.Razorpay(options);
		paymentObject.open();
	};

	const handleYearlyChequePayment = async () => {
		try {
			const resPayment = await axios.post("/api/rzp_payments", {
				member_id: memberDetail?.id,
				chapter_id: memberDetail?.chapter_id,
				amount: totalAmount.toFixed(2),
				status: "pending",
				verification_code: verificationCode,
				payment_type: "meeting fees",
				mode: "cheque",
				email: memberDetail?.email,
				contact: memberDetail?.primary_number,
				invoice_no: await generateInvoiceNumber(),
				start_payment_date: moment(startDate * 1000).format("YYYY-MM-DD"),
				end_payment_date: moment(endDate * 1000).format("YYYY-MM-DD"),
				penalty_fees: pendingMonth * 100,
				outstanding_balance: userData.outstanding_balance,
			});

			if (resPayment.status === 200) {
				router.push({
					pathname: "/payments/cheque_success",
					query: {
						verificationCode: verificationCode,
					},
				});
			}
		} catch (err) {
			console.error("Error updating payments", err);
		}
	};

	const handleTillRenewalChequePayment = async () => {
		try {
			const resPayment = await axios.post("/api/rzp_payments", {
				member_id: memberDetail?.id,
				chapter_id: memberDetail?.chapter_id,
				amount: subTotalAmount,
				discount: tillDisAmount,
				cgst: cgst,
				sgst: sgst,
				total_amount: finalAmount,
				status: "pending",
				verification_code: verificationCode,
				payment_type: "meeting fees",
				mode: "cheque",
				email: memberDetail?.email,
				contact: memberDetail?.primary_number,
				invoice_no: await generateInvoiceNumber("GB"),
				start_payment_date: tillStartDate,
				end_payment_date: tillEndDate,
				penalty_fees: pendingMonth * 100,
				outstanding_balance: userData.outstanding_balance,
			});

			if (resPayment.status === 200) {
				router.push({
					pathname: "/payments/cheque_success",
					query: {
						verificationCode: verificationCode,
					},
				});
			}
		} catch (err) {
			console.error("Error updating payments", err);
		}
	};
	const handleTillRenewalOnlinePayment = async () => {
		const res = await initializeRazorpay();

		if (!res) {
			alert("Razorpay SDK Failed to load");
			return;
		}

		try {
			const Amount = finalAmount * 100;
			const resOrder = await axios.post("/api/create-order", {
				amount: Amount.toFixed(2),
				currency: "INR",
				chapter_id: userData?.chapter_id,
				gstin: userData?.gst_no,
				member_email: userData?.email,
				member_name: `${userData?.first_name} ${userData?.last_name}`,
				member_phone: userData?.primary_number,
				remark: "BNI Till Renewal Meeting Fees",
				type: "till_renewal",
				penalty_fees: pendingMonth * 100,
				outstanding_balance: userData.outstanding_balance,
				start_at: tillStartDate,
				end_at: tillEndDate,
			});
			if (resOrder.status === 200) {
				const resPayment = await axios.post("/api/rzp_payments", {
					member_id: userData?.id,
					chapter_id: userData?.chapter_id,
					payment_type: "meeting fees",
					amount: subTotalAmount,
					discount: tillDisAmount,
					cgst: cgst,
					sgst: sgst,
					total_amount: finalAmount.toFixed(2),
					status: "pending",
					mode: "online",
					order_id: resOrder.data?.id,
					// invoice_no: await generateInvoiceNumber("GB"),
					email: memberDetail?.email,
					contact: memberDetail?.primary_number,
					start_payment_date: tillStartDate,
					end_payment_date: tillEndDate,
					penalty_fees: pendingMonth * 100,
					outstanding_balance: userData.outstanding_balance,
				});
			}
			const options = {
				key: process.env.RAZORPAY_KEY,
				name: userData?.company_name,
				currency: resOrder.data?.currency,
				amount: resOrder.data?.amount,
				order_id: resOrder.data?.id,
				description: "Meeting Fees Payment",
				prefill: {
					name: `${userData?.first_name} ${userData?.last_name}`,
					email: userData?.email,
					contact: userData?.primary_number,
				},
				image: "/assets/images/logo/bni_surat_logo.png",
				handler: async function (response) {
					if (response.razorpay_payment_id) {
						router.push("/payments/manage_payment");
						// const responsePayment = await axios.get(
						//   `/api/payment/${response.razorpay_payment_id}`,
						//   {
						//     headers: {
						//       Authorization: `Bearer ${localStorage.getItem("signIn")}`,
						//     },
						//   }
						// );

						// await axios.put(
						//   `/api/members/${userData?.id}`,
						//   {
						//     mf_end_date: tillEndDate,
						//   },
						//   {
						//     headers: {
						//       Authorization: `Bearer ${localStorage.getItem("signIn")}`,
						//     },
						//   }
						// );

						// if (responsePayment?.status === 200) {
						//   const payment_type = "MEETING FEES";
						//   await KittyBalaceAPI(
						//     tillStartDate,
						//     tillEndDate,
						//     userData?.chapter_id,
						//     userData?.first_name,
						//     userData?.last_name,
						//     payment_type,
						//     Number(chaptersData?.weekly_meeting_fees)
						//   );
						//   try {
						//     const resPayment = await axios.post("/api/rzp_payments", {
						//       member_id: userData?.id,
						//       chapter_id: userData?.chapter_id,
						//       payment_id: response.razorpay_payment_id,
						//       payment_type: "meeting fees",
						//       entity: responsePayment.data?.entity,
						//       amount: subTotalAmount,
						//       discount: tillDisAmount,
						//       cgst: cgst,
						//       sgst: sgst,
						//       total_amount: finalAmount,
						//       currency: responsePayment.data?.currency,
						//       status: responsePayment.data?.status,
						//       mode: "online",
						//       order_id: response.razorpay_order_id,
						//       invoice_no: generateInvoiceNumber(),
						//       email: memberDetail?.email,
						//       contact: memberDetail?.primary_number,
						//       start_payment_date: tillStartDate,
						//       end_payment_date: tillEndDate,
						//     });
						//     if (resPayment.status === 200) {
						//       router.push("/payments/manage_payment");
						//     }
						//   } catch (err) {
						//     console.error("error update into payments", err);
						//   }
						// }
					}
				},
			};
			const paymentObject = new window.Razorpay(options);
			paymentObject.open();
		} catch (error) {
			console.error("", error);
		}
	};

	const handleMonthlyOnlinePayment = async () => {
		const res = await initializeRazorpay();

		if (!res) {
			alert("Razorpay SDK Failed to load");
			return;
		}

		try {
			const finalAmountInPaise = totalAmount.toFixed(2);
			const resOrder = await axios.post("/api/create-order", {
				amount: finalAmountInPaise * 100,
				currency: "INR",
				chapter_id: userData?.chapter_id,
				gstin: userData?.gst_no,
				member_email: userData?.email,
				member_name: `${userData?.first_name} ${userData?.last_name}`,
				member_phone: userData?.primary_number,
				remark: "BNI Meeting Fees",
				type: "meeting_fees",
				penalty_fees: pendingMonth * 100,
				outstanding_balance: userData.outstanding_balance,
				start_at: monthlyStartDate,
				end_at: monthlyEndDate,
			});
			if (resOrder.status === 200) {
				const resPayment = await axios.post("/api/rzp_payments", {
					member_id: userData?.id,
					chapter_id: userData?.chapter_id,
					payment_type: "meeting fees",
					amount: subTotalAmount,
					discount: discount,
					cgst: cgst,
					sgst: sgst,
					total_amount: totalAmount.toFixed(2),
					mode: "online",
					order_id: resOrder.data?.id,
					status: "pending",
					// invoice_no: await generateInvoiceNumber("GB"),
					email: memberDetail?.email,
					contact: memberDetail?.primary_number,
					start_payment_date: monthlyStartDate,
					end_payment_date: monthlyEndDate,
					penalty_fees: pendingMonth * 100,
					outstanding_balance: userData.outstanding_balance,
				});
			}
			const options = {
				key: process.env.RAZORPAY_KEY,
				name: userData?.company_name,
				currency: resOrder.data?.currency,
				amount: resOrder.data?.amount,
				order_id: resOrder.data?.id,
				description: "Meeting Fees Payment",
				prefill: {
					name: `${userData?.first_name} ${userData?.last_name}`,
					email: userData?.email,
					contact: userData?.primary_number,
				},
				image: "/assets/images/logo/bni_surat_logo.png",
				handler: async function (response) {
					if (response.razorpay_payment_id) {
						router.push("/payments/manage_payment");
						toast.success("Monthly payment successfully!");
						// const responsePayment = await axios.get(
						//   `/api/payment/${response.razorpay_payment_id}`,
						//   {
						//     headers: {
						//       Authorization: `Bearer ${localStorage.getItem("signIn")}`,
						//     },
						//   }
						// );

						// await axios.put(
						//   `/api/members/${userData?.id}`,
						//   {
						//     mf_start_date: monthlyStartDate,
						//     mf_end_date: monthlyEndDate,
						//   },
						//   {
						//     headers: {
						//       Authorization: `Bearer ${localStorage.getItem("signIn")}`,
						//     },
						//   }
						// );

						// if (responsePayment?.status === 200) {
						//   const payment_type = "MEETING FEES";
						//   await KittyBalaceAPI(
						//     monthlyStartDate,
						//     monthlyEndDate,
						//     userData?.chapter_id,
						//     userData?.first_name,
						//     userData?.last_name,
						//     payment_type,
						//     Number(chaptersData?.weekly_meeting_fees)
						//   );
						//   try {
						//     const resPayment = await axios.post("/api/rzp_payments", {
						//       member_id: userData?.id,
						//       chapter_id: userData?.chapter_id,
						//       payment_id: response.razorpay_payment_id,
						//       payment_type: "meeting fees",
						//       entity: responsePayment.data?.entity,
						//       amount: subTotalAmount,
						//       discount: discount,
						//       cgst: cgst,
						//       sgst: sgst,
						//       total_amount: finalAmountInPaise,
						//       currency: responsePayment.data?.currency,
						//       status: responsePayment.data?.status,
						//       mode: "online",
						//       order_id: response.razorpay_order_id,
						//       invoice_no: generateInvoiceNumber(),
						//       email: memberDetail?.email,
						//       contact: memberDetail?.primary_number,
						//       start_payment_date: monthlyStartDate,
						//       end_payment_date: monthlyEndDate,
						//     });
						//     if (resPayment.status === 200) {
						//       router.push("/payments/manage_payment");
						//     }
						//   } catch (err) {
						//     console.error("error update into payments", err);
						//   }
						// }
					}
				},
			};
			const paymentObject = new window.Razorpay(options);
			paymentObject.open();
		} catch (error) {
			console.error("", error);
		}
	};

	const handleMonthlyChequePayment = async () => {
		try {
			const resPayment = await axios.post("/api/rzp_payments", {
				member_id: memberDetail?.id,
				chapter_id: memberDetail?.chapter_id,
				amount: subTotalAmount,
				discount: discount,
				cgst: cgst,
				sgst: sgst,
				total_amount: totalAmount.toFixed(2),
				status: "pending",
				verification_code: verificationCode,
				payment_type: "meeting fees",
				mode: "cheque",
				email: memberDetail?.email,
				contact: memberDetail?.primary_number,
				invoice_no: await generateInvoiceNumber("GB"),
				start_payment_date: monthlyStartDate,
				end_payment_date: monthlyEndDate,
				penalty_fees: pendingMonth * 100,
				outstanding_balance: userData.outstanding_balance,
			});

			if (resPayment.status === 200) {
				router.push({
					pathname: "/payments/cheque_success",
					query: {
						verificationCode: verificationCode,
					},
				});
			}
		} catch (err) {
			console.error("Error updating payments", err);
		}
	};
	const fetchUserData = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("signIn")}`,
				},
			};
			try {
				const response = await axios.get("/api/profile", config);
				setUserData(response.data?.user);
				localStorage.setItem(
					"members_detail",
					JSON.stringify(response.data?.user)
				);
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		}
	};

	const handleCDPSPayment = async () => {
		const res = await initializeRazorpay();

		if (!res) {
			alert("Razorpay SDK Failed to load");
			return;
		}

		const startDate = new Date();

		const startFormattedDate = moment(startDate).format("YYYY-MM-DD");
		const amount = 4720;
		const finalAmountInPaise = amount * 100;

		try {
			const resOrder = await axios.post("/api/create-order", {
				amount: finalAmountInPaise,
				currency: "INR",
				chapter_id: userData?.chapter_id,
				gstin: userData?.gst_no,
				member_email: userData?.email,
				member_name: `${userData?.first_name} ${userData?.last_name}`,
				member_phone: userData?.primary_number,
				remark: "BNI CDPS Fees",
				type: "CDPS_fees",
				penalty_fees: pendingMonth * 100,
				outstanding_balance: userData.outstanding_balance,
			});
			let resPayment;
			if (resOrder.status === 200) {
				resPayment = await axios.post("/api/rzp_payments", {
					member_id: userData?.id,
					chapter_id: userData?.chapter_id,
					// payment_id: response.razorpay_payment_id,
					payment_type: "CDPS Payment",
					// entity: responsePayment.data?.entity,
					amount: amount,
					discount: 0,
					cgst: 0,
					sgst: 0,
					total_amount: amount,
					currency: resOrder.data?.currency,
					status: "pending",
					// invoice_no: await generateInvoiceNumber("GB"),
					order_id: resOrder.data?.id,
					mode: "online",
					email: memberDetail?.email,
					contact: memberDetail?.primary_number,
					start_payment_date: startFormattedDate,
					penalty_fees: pendingMonth * 100,
					outstanding_balance: userData.outstanding_balance,
				});
			}
			const options = {
				key: process.env.RAZORPAY_KEY,
				name: userData?.company_name,
				currency: resOrder.data?.currency,
				amount: resOrder.data?.amount,
				order_id: resOrder.data?.id,
				description: "CDPS Payment",
				prefill: {
					name: `${userData?.first_name} ${userData?.last_name}`,
					email: userData?.email,
					contact: userData?.primary_number,
				},
				image: "/assets/images/logo/bni_surat_logo.png",
				handler: async function (response) {
					if (response.razorpay_payment_id) {
						toast.success("CDPS payment successfully!");
						// router.push("/payments/manage_payment");
						const responsePayment = await axios.get(
							`/api/payment/${response.razorpay_payment_id}`,
							{
								headers: {
									Authorization: `Bearer ${localStorage.getItem("signIn")}`,
								},
							}
						);

						if (responsePayment?.status === 200) {
							const resUpdatePayment = await axios.put(
								`/api/rzp_payments/${resPayment.data.rzpPayment?.id}`,
								{
									// member_id: userData?.id,
									payment_id: response.razorpay_payment_id,
									entity: responsePayment.data?.entity,
									currency: responsePayment.data?.currency,
									status: responsePayment.data?.status,
									mode: "online",
									order_id: response.razorpay_order_id,
								},
								{
									headers: {
										Authorization: `Bearer ${localStorage.getItem("signIn")}`,
									},
								}
							);
							if (resUpdatePayment.status === 200) {
								await axios.put(
									`/api/members/${userData?.id}`,
									{
										flag: true,
									},
									{
										headers: {
											Authorization: `Bearer ${localStorage.getItem("signIn")}`,
										},
									}
								);
								toast.success("CDPS payment successfully!");
								router.push("/payments/manage_payment");
								fetchUserData();
							}
						}
					}
				},
			};
			const paymentObject = new window.Razorpay(options);
			paymentObject.open();
		} catch (error) {
			console.error("Error:", error);
		}
	};

	useEffect(() => {
		// Generate verification code
		const generateVerificationCode = () => {
			const code = Math.floor(100000 + Math.random() * 900000);
			setVerificationCode(code.toString());
		};

		generateVerificationCode();
	}, []);

	useEffect(() => {
		chapterFetchData();
	}, [userData]);

	useEffect(() => {
		fetchUserData();
	}, []);

	useEffect(() => {
		const startDate = userData?.mf_end_date
			? new Date(userData?.mf_end_date)
			: new Date(userData?.manual_induction);
		const startAt = Math.floor(startDate.getTime() / 1000);
		setStartDate(startAt);
		// Calculate the timestamp for the end date (52 weeks from the start date)
		const endAt = startAt + 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
		setEndDate(endAt);
	}, [userData]);

	return (
		<Layout>
			<div className="page-body">
				<Row sm="12" md="6">
					<Col sm="12" md="12">
						<Card>
							<CardBody className="card">
								<div className="dashboard-item">
									<i className="fas fa-user icon"></i>
									<div className="details">
										<span className="label">Full Name</span>
										<span className="value">
											{userData?.first_name + " " + userData?.last_name}
										</span>
									</div>
								</div>
								<div className="dashboard-item">
									<i className="fas fa-map-marker-alt icon"></i>
									<div className="details">
										<span className="label">Home Chapter</span>
										<span className="value">{chaptersData?.chapter_name}</span>
									</div>
								</div>
								<div className="dashboard-item">
									<i className="fas fa-calendar-alt icon"></i>
									<div className="details">
										<span className="label">Membership Renewal Date</span>
										<span className="value">
											{moment(userData?.membership_end_date).format("LL")}
										</span>
									</div>
								</div>
								<div className="dashboard-item">
									<i className="fas fa-coins icon"></i>
									<div className="details">
										<span className="label">Meeting Fees Clear Till</span>
										<span className="value">
											{userData && userData.mf_end_date
												? moment(userData?.mf_end_date).format("LL")
												: moment(userData?.manual_induction).format("LL")}
										</span>
									</div>
								</div>
							</CardBody>

							<CardFooter className="text-center">
								<Row>
									{userData?.flag === 1 ? (
										<>
											<Col md="2" xs="12" sm="4" className="mb-1">
												<Btn
													color="primary"
													onClick={() => handleOptionSelection("payOneMonthly")}
													block>
													Pay one month
												</Btn>
											</Col>
										</>
									) : (
										<Col md="2" xs="12" sm="4" className="mb-1">
											<Btn color="primary" onClick={handleCDPSPayment} block>
												CDPS Payment
											</Btn>
										</Col>
									)}
									<Col md="2" xs="12" sm="4" className="mb-1">
										<Btn
											color="primary"
											onClick={() => handleOptionSelection("paySixMonthly")}
											block>
											Pay six month
										</Btn>
									</Col>
									<Col md="2" xs="12" sm="4" className="mb-1">
										<Btn
											color="primary"
											onClick={() => handleOptionSelection("yearly")}
											block>
											Pay yearly
										</Btn>
									</Col>
									{/* <Btn
                      color="primary"
                      onClick={handleSubscriptionPayment}
                      block
                      >
                      Subscribe monthly
                    </Btn> */}

									{/* <Col md="2" xs="12" sm="4" className="mb-1">
                    <Btn
                      color="primary"
                      onClick={() => handleOptionSelection("yearly")}
                      block
                    >
                      Pay yearly
                    </Btn>
                  </Col> */}
									{/* <Col md="2" xs="12" sm="4" className="mb-1">
                      <Btn
                        color="primary"
                        onClick={() => handleOptionSelection("payOneMonthly")}
                        block
                      >
                        Pay one month
                      </Btn>
                    </Col> */}

									<Col md="2" xs="12" sm="4" className="mb-1">
										<Btn
											color="primary"
											onClick={() => handleOptionSelection("tillRenewal")}
											block>
											Pay till renewal
										</Btn>
									</Col>
									<Col md="3" xs="12" sm="4" className="mb-1">
										<Btn
											color="primary"
											onClick={() => handleOptionSelection("membershipRenewal")}
											block>
											Pay membership renewal
										</Btn>
									</Col>
								</Row>
							</CardFooter>
						</Card>
					</Col>
				</Row>
				{/* {selectedOption === "yearly" && (
          <Row sm="12" md="6">
            <Col md="12">
              <Card>
                <CardBody>
                  <Row>
                    <Col md="8"></Col>
                    <Col md="4">
                      <div className="">
                        <div className="pt-2 mb-3">
                          <h6 className="mb-3">Total due</h6>
                          <div className="table-responsive">
                            <table className="table">
                              <tbody>
                                <tr>
                                  <th>Subtotal:</th>
                                  <td className="text-end">
                                    ₹{subTotalAmount.toFixed(0)}
                                  </td>
                                </tr>
                                <tr>
                                  <th>Discount:</th>
                                  <td className="text-end">
                                    ₹{discount.toFixed(0)}
                                  </td>
                                </tr>
                                <tr>
                                  <th>CGST (9%):</th>
                                  <td className="text-end">
                                    ₹{cgst.toFixed(2)}
                                  </td>
                                </tr>
                                <tr>
                                  <th>SGST (9%):</th>
                                  <td className="text-end">
                                    ₹{sgst.toFixed(2)}
                                  </td>
                                </tr>
                                <tr className="border-0">
                                  <th>Total :</th>
                                  <td className="text-end">
                                    ₹{totalAmount.toFixed(2)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Col md="12" className="text-end">
                    <>
                      <Btn
                        type="submit"
                        color="primary"
                        className="me-1"
                        onClick={() => handleYearlyOnlinePayment()}
                      >
                        Pay Online
                      </Btn>
                      <Btn
                        type="submit"
                        color="primary"
                        onClick={() => handleYearlyChequePayment()}
                      >
                        Pay Cheque
                      </Btn>
                    </>
                  </Col>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )} */}
				{(selectedOption === "payOneMonthly" ||
					selectedOption === "paySixMonthly" ||
					selectedOption === "yearly") && (
					<div>
						<Formik
							initialValues={{
								paymentTerm: "",
							}}
							// validationSchema={validationSchema}
							// onSubmit={(values, { setSubmitting }) => {
							//   setSubmitting(false);
							// }}
						>
							{({ isSubmitting, values, setFieldValue }) => (
								<Form className="theme-form">
									<Card>
										<CardBody>
											{/* <Row>
                        <Col md="4">
                          <FormGroup>
                            <Label htmlFor="paymentTerm">Payment Term</Label>
                            <Field
                              as="select"
                              name="paymentTerm"
                              id="paymentTerm"
                              className="form-select"
                              onChange={(e) => {
                                setSelectMonth(e.target.value);
                                calculateAmountBasedOnPaymentTerm(
                                  e.target.value
                                );
                              }}
                              value={selectMonth}
                            >
                              <option value="">Select</option>
                              <option value="1_month">1 Month</option>
                              <option value="6_month">6 Month</option>
                              <option value="12_month">12 Month</option>
                            </Field>
                            <ErrorMessage
                              name="paymentTerm"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                      </Row> */}
											<div className="table-responsive">
												<table className="table table-lg">
													<thead>
														<tr>
															<th>Description</th>
															<th>Rate</th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<td>
																<h6 className="mb-0 fw-bold">
																	{monthlyTotalWeeks} * Meeting Fees
																</h6>
																<p>
																	{moment(monthlyStartDate).format(
																		"DD-MMM-YYYY"
																	)}{" "}
																	to{" "}
																	{moment(monthlyEndDate).format("DD-MMM-YYYY")}
																</p>
																{pendingMonth !== 0 && (
																	<p className="mb-0 fw-bold">
																		{pendingMonth} * 100 (Penalty fees)
																	</p>
																)}
																<p className="fw-bold">Outstanding</p>
															</td>
															<td className="font-weight-semibold">
																<p>₹{chaptersData?.weekly_meeting_fees}</p>
																<p>₹{pendingMonth * 100}</p>
																<p>₹{userData.outstanding_balance}</p>
															</td>
														</tr>
													</tbody>
												</table>
											</div>
											<CardBody>
												<Row>
													<Col md="8"></Col>
													<Col md="4">
														<div className="">
															<div className="pt-2 mb-3">
																<h6 className="mb-3">Total due</h6>
																<div className="table-responsive">
																	<table className="table">
																		<tbody>
																			<tr>
																				<th>Subtotal:</th>
																				<td className="text-end">
																					₹{subTotalAmount.toFixed(0)}
																				</td>
																			</tr>
																			{selectMonth === "6_month" ||
																			selectMonth === "12_month" ? (
																				<tr>
																					<th>Discount:</th>
																					<td className="text-end">
																						₹{discount.toFixed(0)}
																					</td>
																				</tr>
																			) : (
																				""
																			)}
																			<tr>
																				<th>CGST (9%):</th>
																				<td className="text-end">
																					₹{cgst.toFixed(2)}
																				</td>
																			</tr>
																			<tr>
																				<th>SGST (9%):</th>
																				<td className="text-end">
																					₹{sgst.toFixed(2)}
																				</td>
																			</tr>
																			<tr className="border-0">
																				<th>Total :</th>
																				<td className="text-end">
																					₹{totalAmount.toFixed(2)}
																				</td>
																			</tr>
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
													</Col>
												</Row>
											</CardBody>
											<Col md="12" className="text-end">
												<>
													<Btn
														type="submit"
														color="primary"
														className="me-1"
														onClick={() => handleMonthlyOnlinePayment()}>
														Pay Online
													</Btn>
													<Btn
														type="submit"
														color="primary"
														onClick={() => handleMonthlyChequePayment()}>
														Pay Cheque
													</Btn>
												</>
											</Col>
										</CardBody>
									</Card>
								</Form>
							)}
						</Formik>
					</div>
				)}
				{selectedOption === "tillRenewal" && (
					<Row sm="12" md="6">
						<Col md="12">
							<Card>
								<div className="table-responsive">
									<table className="table table-lg">
										<thead>
											<tr>
												<th>Description</th>
												<th>Rate</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													<h6 className="mb-0 fw-bold">
														{totalWeeks} * Meeting Fees
													</h6>
													<p>
														{moment(tillStartDate).format("DD-MMM-YYYY")} to{" "}
														{moment(tillEndDate).format("DD-MMM-YYYY")}
													</p>
													{pendingMonth !== 0 && (
														<h6 className="mb-0 fw-bold">
															{pendingMonth} * 100 (Penalty fees)
														</h6>
													)}
													<p className="fw-bold">Outstanding</p>
												</td>
												<td className="font-weight-semibold">
													<p>₹{chaptersData?.weekly_meeting_fees}</p>
													<p>₹{pendingMonth * 100}</p>
													<p>₹{userData.outstanding_balance}</p>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<CardBody>
									<Row>
										<Col md="8"></Col>
										<Col md="4">
											<div className="">
												<div className="pt-2 mb-3">
													<h6 className="mb-3">Total due</h6>
													<div className="table-responsive">
														<table className="table">
															<tbody>
																<tr>
																	<th>Subtotal:</th>
																	<td className="text-end">
																		₹{tillAmount.toFixed(0)}
																	</td>
																</tr>
																<tr>
																	<th>Discount:</th>
																	<td className="text-end">
																		₹{tillDisAmount.toFixed(2)}
																	</td>
																</tr>
																<tr>
																	<th>CGST (9%):</th>
																	<td className="text-end">
																		₹{cgst.toFixed(2)}
																	</td>
																</tr>
																<tr>
																	<th>SGST (9%):</th>
																	<td className="text-end">
																		₹{sgst.toFixed(2)}
																	</td>
																</tr>
																<tr className="border-0">
																	<th>Total :</th>
																	<td className="text-end">
																		₹{finalAmount.toFixed(2)}
																	</td>
																</tr>
															</tbody>
														</table>
													</div>
												</div>
											</div>
										</Col>
									</Row>
									<Col md="12" className="text-end">
										<>
											<Btn
												type="submit"
												color="primary"
												className="me-1"
												onClick={() => handleTillRenewalOnlinePayment()}>
												Pay Online
											</Btn>
											<Btn
												type="submit"
												color="primary"
												onClick={() => handleTillRenewalChequePayment()}>
												Pay Cheque
											</Btn>
										</>
									</Col>
								</CardBody>
							</Card>
						</Col>
					</Row>
				)}
				{selectedOption === "membershipRenewal" && (
					<Row sm="12" md="6">
						<Col md="12">
							<MembershipRenewal />
						</Col>
					</Row>
				)}
				<WhatsappPop />
			</div>
		</Layout>
	);
};

export default Index;

