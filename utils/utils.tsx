import axios from "axios";

const fetchLastGeneratedId = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_PUBLIC_URL}/api/last-payment-id`
    );
    return response.data.lastGeneratedId;
  } catch (error) {
    console.error("Failed to fetch last generated ID", error);
    return null;
  }
};

export const generateInvoiceNumber = async (prefix: any) => {
  // const prefix = "GB";

  // Fetch the last generated ID and make the payment request
  let lastNumber = await fetchLastGeneratedId();

  if (lastNumber === null || lastNumber === undefined) {
    lastNumber = "00000";
  } else {
    const match = lastNumber.match(/(\d{5})$/);
    lastNumber = match ? match[0] : "00000";
  }

  const currentDate = new Date();
  const fiscalYearStart = new Date(currentDate.getFullYear(), 3, 1); // April 1st of the current year
  let fiscalYearStartYear;

  if (currentDate < fiscalYearStart) {
    fiscalYearStartYear = currentDate.getFullYear() - 1; // Last year if before April 1st
  } else {
    fiscalYearStartYear = currentDate.getFullYear(); // This year if after April 1st
  }

  const fiscalYearEndYear = fiscalYearStartYear + 1;
  const fiscalYear = `${fiscalYearStartYear
    .toString()
    .slice(-2)}-${fiscalYearEndYear.toString().slice(-2)}`;

  // // Increment the last number and pad it with zeros to ensure it's 5 digits long
  lastNumber = (parseInt(lastNumber) + 1).toString().padStart(5, "0");

  // Combine all parts to form the invoice number
  const invoiceNumber = `${prefix}/${fiscalYear}/${lastNumber}`;
  return invoiceNumber;
};
