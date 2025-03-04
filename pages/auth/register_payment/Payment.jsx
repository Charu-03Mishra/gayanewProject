import React, { useEffect, useState } from 'react'
import SnackbarWithDecorators, { changeText } from './Utils'
import api from './api';

const Payment = () => {
    const [snackAlert, setSnackAlert] = useState(false); // popup success or error
    const [snackbarProperty, setSnackbarProperty] = useState({ // popup success or error text
        text: '',
        color: ''
    });
    const [details, setDetails] = useState({
        firstName: '',
        lastName: '',
        companyIndustry: '',
        chapterName: '',
        position: '',
        phoneNumber: '',
        altPhoneNumber: '',
        faxNumber: '',
        cellNumber: '',
        email: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        gstNumber: '',
        member: '',
        association: ''
    });
    const [isBNIMember, setIsBNIMember] = useState(false);
    const [isAssociationMember, setIsAssociationMember] = useState(false);
    const [pay_success, setPay_success] = useState(false);
    const [pay_id, setPay_id] = useState("");
    const handleCheckboxChange = (e) => {
        setDetails({
            ...details,
            member: e.target.value
        })
        setIsBNIMember(e.target.value === 'BNI member');
        setIsAssociationMember(e.target.value === 'Association member');
    };
    const [isLoaded, setIsLoaded] = useState(false);
    const [responseId, setResponseId] = useState("");
    const validateDetails = (details) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneNumberRegex = /^\d{10}$/; // Assuming phone numbers are 10 digits long
        const websiteRegex = /^(https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,}|localhost)(:\d+)?(\/[^\s]*)?$/i;
        const gstNumberRegex = /^[A-Z]{2}[0-9]{4}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9][A-Z0-9]$/;
    
        const {
            email,
            phoneNumber,
            altPhoneNumber,
            website,
            gstNumber,
            firstName,
            lastName,
            companyIndustry,
            chapterName,
            position,
            address,
            city,
            state,
            zip,
            speciality,
            company_hospitalname,
            member,
            association
        } = details;
    
        // Check if all required fields are filled
        if (!firstName || !lastName || !speciality ||
            !company_hospitalname || !phoneNumber || !email ||
            !city || !zip ) {
            return {success: false, message: "* fields must be filled in"};
        }
        if(isBNIMember && !chapterName){
            return {success: false, message: "Chapter name field must be filled in"};
        }
        if(isAssociationMember && !association){
            return {success: false, message: "Association name field must be filled in"};
        }
    
        // Validate phone number format
        if (!phoneNumberRegex.test(phoneNumber)) {
            return {success: false, message: "Invalid phone number format"};
        }
    
        // Validate alt phone number format
        // if (altPhoneNumber != "" && !phoneNumberRegex.test(altPhoneNumber)) {
        //     return {success: false, message: "Invalid alternate phone number format"};
        // }
    
        // Validate email format
        if (!emailRegex.test(email)) {
            return {success: false, message: "Invalid email format"};
        }
    
        // Validate website URL format
        // if (website != "" && !websiteRegex.test(website)) {
        //     return {success: false, message: "Invalid website URL format"};
        // }
    
        // Validate GST number format
        if (gstNumber != "" && !gstNumberRegex.test(gstNumber)) {
            return {success: false, message: "Invalid GST number format"};
        }
    
        // If all validations pass
        return {success: true};
    };
    
    const handlePayment = () => {
        const validationResult = validateDetails(details);
        console.log("validationResult", validationResult);
    
        if (validationResult.success) {
            // Proceed with payment
            api("register_payment", "post", details)
                .then((res) => {
                    console.log("res", res);
                    if (res?.response?.data.success === false) {
                        setSnackbarProperty(prevState => ({
                            ...prevState,
                            text: res.response.data.message,
                            color: "danger"
                        }));
                        setSnackAlert(true);
                        return;
                    } else {
                        handleRazorpayScreen(res);
                    }
                })
                .catch((err) => {
                    console.log("err", err);
                });
        } else {
            console.log(validationResult.message);
            setSnackbarProperty(prevState => ({
                ...prevState,
                text: validationResult.message,
                color: "danger"
            }));
            setSnackAlert(true);
            return;
        }
    };

    const handleRazorpayScreen = async (res) => {
        const res_integrate = await initializeRazorpay();
        if (!res_integrate) {
        alert("Razorpay SDK Failed to load");
        return;
        }

        console.log("res?.data?.order_id", res?.data?.order_id);
        const options = {
            key: process.env.RAZORPAY_KEY,
            amount: 1 * 100,
            currency: "INR",
            name: `${details.firstName} ${details.lastName}`,
            description: "Test",
            image: "/assets/images/logo/bni_surat_logo.png",
            order_id: res?.data?.order_id,
            callback_url: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/api/register_payment/paymentVerification?user_id=${res?.data?.user_id}&member=${details.member}`,
            prefill: {
                name: `${details.firstName} ${details.lastName}`,
                email: `${details.email}`,
                contact: `${details.phoneNumber}`,
            },
            notes: {
                "name": `${details?.firstName} ${details.lastName}`,
                "phone": `${details?.phoneNumber}`,
                "chapter": `${details?.chapterName}`,
                "address": `${details?.address}`,
                "member": `${details.member}`
            },
            theme: {
                "color": "#121212"
            }
        };
        const razor = new window.Razorpay(options);
        razor.open();
    }
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
    // Check URL parameters for razorpay_payment_id
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const razorpayPaymentId = urlParams.get('reference');
        console.log("razorpayPaymentId", razorpayPaymentId);
        if (razorpayPaymentId) {
            // Set state for payment success message
            setSnackbarProperty({
                text: "Payment was successful!",
                color: "success"
            });
            setSnackAlert(true);
            setPay_success(true);
            setPay_id(razorpayPaymentId);
        }
    }, []);
   
    const initializeTailwind = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://cdn.tailwindcss.com";
    
          script.onload = () => {
            resolve(true);
          };
          script.onerror = () => {
            resolve(false);
          };
    
          document.body.appendChild(script);
        });
      };
    const handle = async () => {
        const res_integrate = await initializeTailwind();
        if (!res_integrate) {
            alert("Razorpay SDK Failed to load");
            return;
        }
    }
    //   useEffect(async () => {
    //     console.log("callledd");
    //     await handle();
    //   }, []);
    useEffect(() => {
        console.log("details", details);
    }, [details]);
    // useEffect(async () => {
    //     console.log("callledd");
    //     await handle();
    //   }, []);
    handle();
    
  return (
    <>
    {
        snackAlert?
        <SnackbarWithDecorators snackAlert={snackAlert} setSnackAlert={setSnackAlert} text={snackbarProperty.text} color={snackbarProperty.color} />
        :null
    }
    <div className='my-[80] w-[90%] md:w-3/4 lg:w-3/6 m-auto'>
        <img className='my-5 m-auto' src="/assets/images/logo/bni_surat_logo.png" alt="" />
        {
            pay_success &&
            <div className='pay_success my-5'>
                <div class="card">
                    <svg class="wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                        <path
                        d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
                        fill-opacity="1"
                        ></path>
                    </svg>

                    <div class="icon-container">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        stroke-width="0"
                        fill="currentColor"
                        stroke="currentColor"
                        class="icon"
                        >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        ></path>
                        </svg>
                    </div>
                    <div class="message-text-container">
                        <p class="message-text">Payment Successful</p>
                        <p class="sub-text">Your Payment Id: <b>{pay_id}</b></p>
                    </div>
                    <svg
                        onClick={() => setPay_success(false)}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 15 15"
                        stroke-width="0"
                        fill="none"
                        stroke="currentColor"
                        class="cross-icon"
                    >
                        <path
                        fill="currentColor"
                        d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                        clip-rule="evenodd"
                        fill-rule="evenodd"
                        ></path>
                    </svg>
                </div>
            </div>
        }
        <div className='max-h-full shadow-custom p-5 w-full rounded-sm bg-white'>
            <p className='font-bold text-slate-700'>Registration</p>
            <hr className='my-6' />
            <div className='my-3'>
                <div className="xl:flex">
                    <div className='w-full xl:mr-4'>
                        <label htmlFor="firstName" className="mb-2 text-sm text-start text-grey-900">First Name<span className='text-red-700'>*</span></label>
                        <input id="firstName" type="text" name="firstName" onChange={(e) => changeText(e, setDetails, details)} placeholder="John" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                    </div>
                    <div className='w-full xl:ml-4'>
                        <label htmlFor="lastName" className="mb-2 text-sm text-start text-grey-900">Last Name<span className='text-red-700'>*</span></label>
                        <input id="lastName" type="text" name="lastName" onChange={(e) => changeText(e, setDetails, details)} placeholder="Doe" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                    </div>
                </div>
            </div>
            <div className='my-3'>
                <div className=''>
                    <label htmlFor="isBNIMember" className="text-sm text-start text-grey-900">Are you a BNI member?</label>
                </div>
                <div>
                    <select className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5' onInput={handleCheckboxChange} name="member" id="">
                        <option value="Not a BNI member">Not a BNI member</option>
                        <option value="BNI member">BNI member</option>
                        <option value="Association member">Association member</option>
                    </select>                           
                </div>
            </div>
            
            <div className='my-3'>
                {isBNIMember && (
                    <div className=''>
                    <label htmlFor="chapterName" className="mb-2 text-sm text-start text-grey-900">Chapter Name<span className='text-red-700'>*</span></label>
                    <input id="chapterName" type="text" name="chapterName" onChange={(e) => changeText(e, setDetails, details)} placeholder="Chapter Name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                </div>
                )}
                {isAssociationMember && (
                    <div className=''>
                    <label htmlFor="association" className="mb-2 text-sm text-start text-grey-900">Association Name<span className='text-red-700'>*</span></label>
                    <select id="association" name="association" onChange={(e) => changeText(e, setDetails, details)} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'>
                        <option value="">Choose association name</option>
                        <option value="IMA">IMA</option>
                        <option value="JDF">JDF</option>
                        <option value="SMCA">SMCA</option>
                        <option value="Civil Hospital">Civil Hospital</option>
                    </select>           
                </div>
                )}
            </div>
            <div className='my-3'>
                <div className="xl:flex">
                    <div className='w-full xl:mr-4'>
                        <label htmlFor="speciality" className="mb-2 text-sm text-start text-grey-900">Speciality<span className='text-red-700'>*</span></label>
                        <input id="speciality" type="text" name="speciality" onChange={(e) => changeText(e, setDetails, details)} placeholder="IT" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                    </div>
                    <div className='w-full xl:ml-4'>
                        <label htmlFor="company_hospitalname" className="mb-2 text-sm text-start text-grey-900">Hospital Name / Company Name / Clinic Name<span className='text-red-700'>*</span></label>
                        <input id="company_hospitalname" type="text" name="company_hospitalname" onChange={(e) => changeText(e, setDetails, details)} placeholder="Company Name / Hospital Name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                    </div>
                </div>
            </div>
            <div className='my-3'>
                <div className="xl:flex">
                    <div className='w-full xl:mr-4'>
                        <label htmlFor="phoneNumber" className="mb-2 text-sm text-start text-grey-900">Phone Number<span className='text-red-700'>*</span></label>
                        <input id="phoneNumber" type="number" name="phoneNumber" onChange={(e) => changeText(e, setDetails, details)} placeholder="9876543210" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                    </div>
                    <div className='w-full xl:ml-4'>
                        <label htmlFor="email" className="mb-2 text-sm text-start text-grey-900">Email<span className='text-red-700'>*</span></label>
                        <input id="email" type="email" name="email" onChange={(e) => changeText(e, setDetails, details)} placeholder="demo@example.com" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                    </div>
                </div>
            </div>
            <div className='my-3'>
                <div className="xl:flex">
                    <div className='w-full xl:mr-4'>
                        <label htmlFor="city" className="mb-2 text-sm text-start text-grey-900">City<span className='text-red-700'>*</span></label>
                        <input id="city" type="text" name="city" onChange={(e) => changeText(e, setDetails, details)} placeholder="Surat" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                    </div>
                    <div className='w-full xl:ml-4'>
                        <label htmlFor="zip" className="mb-2 text-sm text-start text-grey-900">Zip<span className='text-red-700'>*</span></label>
                        <input id="zip" type="number" name="zip" onChange={(e) => changeText(e, setDetails, details)} placeholder="123456" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                    </div>
                </div>
            </div>
            <div className='my-3'>
                <div className='w-full'>
                    <label htmlFor="gstNumber" className="mb-2 text-sm text-start text-grey-900">Gst Number</label>
                    <input id="gstNumber" type="text" name="gstNumber" onChange={(e) => changeText(e, setDetails, details)} placeholder="Gst Number" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                </div>
            </div>
            <hr className='my-4' />
            <div className='flex justify-end'>
                <button onClick={handlePayment} type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">Pay</button>
            </div>
        </div>
    </div>
</>
  )
}

export default Payment
