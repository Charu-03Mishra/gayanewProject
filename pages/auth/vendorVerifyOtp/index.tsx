import { useState } from "react";
import axios from "axios";
import { Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap";
import Link from "next/link";
import H3 from "@/pages/components/headings/H3Element";
import Btn from "@/pages/components/button";
import Image from "@/pages/components/media";
import { toast } from "react-toastify";
import localStorage from "@/utils/localStorage";
import { useRouter } from "next/router";
import Loader from "@/pages/Layout/Loader/Loader";

export default function Index() {
  const router = useRouter();
  const primary_number = localStorage?.getItem("vendor-phone");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    setLoading(true);
    if (otp === "") {
      toast.error("Please enter valid OTP");
    } else {
      try {
        const response = await axios.post("/api/vendor-verify-otp", {
          primary_number,
          otp,
        });
        if (response.status === 200) {
          localStorage.setItem("signIn", response.data.token);
          localStorage.setItem("role", response.data.role);
          localStorage.setItem("vendor-details", JSON.stringify(response.data.vendor))
          toast.success("Logged in successfully");
          setLoading(false);
          router.replace("/comman_pages/expense/add_expense");
        }
      } catch (error: any) {
        toast.error(error.response.data.message);
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleVerifyOTP();
    }
  };

  const handleResendOTPClick = async () => {
    try {
      // Call your API here
      const response = await axios.get(
        "http://msgclub.softhubinc.com/rest/otpservice/generate-otp",
        {
          params: {
            AUTH_KEY: "c10a661a952944688a5341afa32aa1ab",
            mobileNumber: primary_number,
          },
        }
      );
      if(response.status === 200) {
        toast.success("OTP resent successfully!");
      }
    } catch (error: any) {
      toast.error("Failed to resend OTP.");
    }
  };

  const handleResendOTPWhatsapp = async () => {
    try {
      //   const otp = Math.floor(100000 + Math.random() * 900000);
      //   const authToken = 'U2FsdGVkX1+1zpS8tZr7JRAk5bGUookn4bSuEvyB2dcp4q5+nomQR3YdgzvIYv/vi/7hUy1zLckSd8Iy4+oQpIbGDoYGB2NWKOyR90r4ZW42X0PK8I6w8G5HsWVnV0wqlVPOOxwcuJ3jdTefMZG2yNx26dIe8k4Jot1zs+6BTmk+QUWhImXWBeuvqRszyzPp';
      //   const response = await axios.post('https://app.11za.in/apis/template/sendTemplate', {
      //   authToken,
      //   sendto: `91${primary_number}`,
      //   originWebsite: 'https://bnigreatersurat.com/',
      //   templateName: 'bni_otp',
      //   language: 'en',
      //   data: [otp.toString()],
      // });
      const response = await axios.post("/api/resend-otp", {
        phone: primary_number,
      });
    } catch (error: any) {
      console.log("error", error);
      toast.error(error);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Container fluid className="p-0">
          <Row className="m-0">
            <Col xs="12" className="p-0">
              <div className="login-card login-dark">
                <div>
                  <div>
                    <Link className="logo text-center" href="">
                      <Image
                        className="img-fluid for-light"
                        src="/assets/images/logo/bni_surat_logo.png"
                        alt="looginpage"
                      />
                    </Link>
                  </div>
                  <div className="login-main">
                    <Form className="theme-form">
                      <H3>Verify OTP</H3>
                      <FormGroup>
                        <Label className="col-form-label">Enter OTP</Label>
                        <Input
                          type="number"
                          required
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          onKeyDown={handleKeyPress}
                        />
                      </FormGroup>
                      <FormGroup className="mb-0 form-sub-title">
                        <div className="text-end mt-3">
                          <Btn
                            color="primary"
                            block
                            className="w-100"
                            onClick={handleVerifyOTP}
                          >
                            Verify OTP
                          </Btn>
                        </div>
                      </FormGroup>
                      <p className="mt-4 mb-0 text-center">
                        Did not recieve OTP?
                        <Link
                          className="ms-2"
                          href=""
                          onClick={handleResendOTPClick}
                        >
                          Resend OTP
                        </Link>{" "}
                        or{" "}
                        <Link
                          className="ms-1"
                          href=""
                          onClick={handleResendOTPWhatsapp}
                        >
                          Resend OTP on Whatsapp
                        </Link>
                      </p>
                    </Form>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
}
