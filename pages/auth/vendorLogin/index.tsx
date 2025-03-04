import React, { useState } from "react";
import axios from "axios";
import { Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import H3 from "@/pages/components/headings/H3Element";
import Loader from "@/pages/Layout/Loader/Loader";
import Btn from "@/pages/components/button";
import Image from "@/pages/components/media";

export default function Index() {
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
        const response = await axios.post("/api/vendorLogin", {
          primary_number: phone,
        });
        if (response.data.otpApiResponse?.responseCode === "3001") {
          setLoading(false);
          localStorage.setItem("vendor-phone", response.data.vendorUser?.phone);
          router.replace("/auth/vendorVerifyOtp");
        }
      }
    } catch (error: any) {
      toast.error(error.response.data.error);
      setLoading(false);
    }
  };

  const handleKeyPressLogin = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSignIn();
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
                      <H3>Sign in to account</H3>
                      <FormGroup>
                        <Label className="col-form-label">Mobile Number</Label>
                        <Input
                          type="tel"
                          required
                          placeholder="Mobile Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onKeyDown={handleKeyPressLogin}
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
