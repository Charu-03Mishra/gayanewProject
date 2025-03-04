import React from "react";
import axios from "axios";
import moment from "moment";

const KittyBalanceAPI = async (
  startDate,
  endDate,
  chapter_id,
  first_name,
  last_name,
  reason,
  chapterAmount
) => {
  // Function to get months between the start and end dates
  const getMonthsBetweenDates = (startDate, endDate) => {
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const months = [];

    let currentMonth = startMoment.clone().startOf("month");

    while (currentMonth.isSameOrBefore(endMoment, "month")) {
      months.push(currentMonth.format("YYYY-MM"));
      currentMonth.add(1, "month");
    }

    return months;
  };

  // Function to get weeks between the start and end dates
  const getWeeksBetweenDates = (startDate, endDate) => {
    // Convert the start and end dates to moments
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    // Calculate the start of the week for the start date
    const startOfWeek = startMoment.startOf("week");

    // Calculate the end of the week for the end date
    const endOfWeek = endMoment.endOf("week");

    // Initialize the current week to the start of the week
    let currentWeek = startOfWeek;
    const weeks = [];

    // Loop through each week from startOfWeek to endOfWeek
    while (currentWeek.isSameOrBefore(endOfWeek, "week")) {
        // Add the current week to the list of weeks
        weeks.push(currentWeek.format("YYYY-MM-DD"));

        // Move to the next week
        currentWeek.add(1, "week");
    }

    // Return the list of weeks
    return weeks;
};

const url = process.env.NEXT_PUBLIC_PUBLIC_URL
  try {
    // Fetch kitty configuration data from the API
    const response = await axios.get(`${url}/api/kitty-config`);

    // Format the start and end dates
    const startFormattedDate = moment(startDate);
    const endFormattedDate = moment(endDate);

    // Get the weeks and months between the dates
    const weeksBetweenDates = getWeeksBetweenDates(startFormattedDate, endFormattedDate);
    const monthsBetweenDates = getMonthsBetweenDates(startFormattedDate, endFormattedDate);
    const matchingCounts = {};

    if (response.status === 200) {
      // Iterate through the response data to calculate matching weeks and months
      response.data.forEach((item) => {
        const rangeFromMonth = moment(item.range_from).startOf("month");
        const rangeToMonth = moment(item.range_to).endOf("month");
        const rangeFrom = moment(item.range_from);
        const rangeTo = moment(item.range_to);
        
        // Calculate matching weeks
        const matchingWeeks = weeksBetweenDates.filter(
          (week) =>
            moment(week).isSameOrAfter(rangeFrom, "day") &&
            moment(week).isSameOrBefore(rangeTo, "day")
        ).length;

        // Calculate matching months
        const matchingMonths = monthsBetweenDates.filter(
          (month) =>
            moment(month).isSameOrAfter(rangeFromMonth) &&
            moment(month).isSameOrBefore(rangeToMonth)
        ).length;

        matchingCounts[item.param] = {
          weeks: matchingWeeks,
          months: matchingMonths,
        };
      });

      // Filter records and perform further calculations
      const filteredRecords = Object.entries(matchingCounts).filter(
        ([_, { weeks, months }]) => weeks !== 0 || months !== 0
      );

      // Process each filtered record
      for (const [kittyType, { weeks, months }] of filteredRecords) {
        let amount = weeks * chapterAmount; // Calculate the amount based on weeks
      
        // Calculate discounts and management charges
        let discount = 0;
        const managementCharge = amount * 0.05;

        // Determine discount based on the number of months
        if (months == 6) {
          discount = amount * 0.06;
        }
        if (months == 7) {
          discount = amount * 0.07;
        }
        if (months == 8) {
          discount = amount * 0.08;
        }
        if (months == 9) {
          discount = amount * 0.09;
        }
        if (months == 10) {
          discount = amount * 0.10;
        }
        if (months == 11) {
          discount = amount * 0.11;
        }
        if (months >= 12) {
          discount = amount * 0.12;
        }

        // Subtract discount from the total amount
        amount -= discount;

        // Calculate GST and total amount
        const gst = (amount * 0.18).toFixed(2);
        const totalAmount = (amount + parseFloat(gst)).toFixed(2);

        // Post the calculated data to the kitty balance API
        const resBalance = await axios.post(`${url}/api/kitty-balance`, {
          chapter_id: chapter_id,
          reason: reason,
          given_by: `${first_name} ${last_name}`,
          amount: amount,
          gst: gst,
          total_amount: totalAmount,
          management_charges: managementCharge.toFixed(2),
          kitty_type: kittyType,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching kitty-config data:", error);
  }
};

export default KittyBalanceAPI;
