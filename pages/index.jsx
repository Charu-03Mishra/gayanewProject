import React, { useState } from "react";
import axios from "axios";
import { Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap";
import Image from "./components/media";
import Link from "next/link";
import H3 from "./components/headings/H3Element";
import Btn from "./components/button";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Loader from "./Layout/Loader/Loader";

export default function Home() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      if (phone === "") {
        toast.error("Please enter your Mobile Number");
        setLoading(false);
      } else {
        const response = await axios.post("/api/login", {
          primary_number: phone,
        });

        if (response.data.otpApiResponse?.responseCode === "3001") {
          localStorage.setItem("phone", response.data.user?.phone);
          setLoading(false);
          router.push("/auth/verifyOtp", undefined ,{shallow: true});
        } else {
          localStorage.setItem("signIn", response.data.token);
          localStorage.setItem("role", response.data.userRole);

          if (response.data.userRole === "admin") {
            localStorage.setItem(
              "members_detail",
              JSON.stringify(response.data?.memberDetails)
            );
            router.push("/dashboard", undefined ,{shallow: true});
            toast.success("Logged in successfully");
            setLoading(false);
          } else if (response.data.userRole === "member") {
            router.push("/comman_pages/dashboard", undefined ,{shallow: true});
            toast.success("Logged in successfully");
            setLoading(false);
          }
        }
      }
    } catch (error) {
      toast.error(error.response.data.error);
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSignIn();
    }
  };

  const handleMember = () => {
    router.replace("/auth/becomeMember");
  };

  const handleVisitor = () => {
    router.replace("/auth/visitorRegistration");
  };

  const handleVendor = () => {
    router.replace("/auth/vendorLogin");
  };

  const handleTerms = () => {
    router.replace("/page/terms");
  };

  const handlePrivacy = () => {
    router.replace("/page/privacy");
  };

  const handleReturn = () => {
    router.replace("/page/refund");
  };

  return (
    <>
    <style jsx>{`
        .highlighted-text {
          font-size: 16px;
          line-height: 1.5;
        }

        .clickable-link {
          color: #0070f3; /* Change to your preferred color */
          text-decoration: underline;
          cursor: pointer;
        }

        .clickable-link:hover {
          color: #0056b3; /* Change to your preferred hover color */
        }
      `}</style>
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
                      <H3>Sign in to account</H3>
                      <FormGroup>
                        <Label className="col-form-label">Mobile Number</Label>
                        <Input
                          type="tel"
                          required
                          placeholder="Mobile Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onKeyDown={handleKeyPress}
                        />
                      </FormGroup>
                      <FormGroup className="mb-0 form-sub-title">
                        <div className="checkbox p-0">
                          <Input id="checkbox1" type="checkbox" />
                          <Label className="text-muted" htmlFor="checkbox1">
                            Remember
                          </Label>
                        </div>

                        <div className="text-end mt-3">
                          <Btn
                            color="primary"
                            block
                            className="w-100"
                            onClick={handleSignIn}
                          >
                            Sign In
                          </Btn>
                        </div>
                      </FormGroup>
                    </Form>
                    <p>By continuing, you're confirming that you've read our <a className="clickable-link" onClick={handleTerms}>Terms & Conditions</a> and <a className="clickable-link" onClick={handlePrivacy}>Privacy Policy</a> and <a className="clickable-link" onClick={handleReturn}>Cancellation Policy</a></p>
                    <hr />
                    <div>
                      <Btn color="dark" block onClick={handleMember}>
                        Become a Member
                      </Btn>
                      <Btn
                        color="dark"
                        block
                        className="mt-2"
                        onClick={handleVisitor}
                      >
                        Visitor Registration
                      </Btn>
                      <Btn
                        color="dark"
                        className="mt-2"
                        block
                        onClick={handleVendor}
                      >
                        Vendor Login
                      </Btn>
                    </div>
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
