import P from "@/pages/components/Paragraph";
import SVG from "@/pages/components/SVG";
import { Col, Container, Row } from "reactstrap";
import { useRouter } from "next/router";

export default function footer() {
const router = useRouter();

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
    <footer className="footer">
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
      <Container fluid>
        <Row>
          <Col
            xs="12"
            md="12"
            className="footer-copyright d-flex flex-wrap align-items-center justify-content-between"
          >
            <P className="mb-2 mb-md-0">© 2022 - 2023. Gaya Connect by My Invented</P>
            <div className="d-flex flex-wrap align-items-center">
              <P className="mb-2 mb-md-0 me-md-4 me-sm-5">
                <i className="fa fa-life-ring" aria-hidden="true"></i> <a className="clickable-link" onClick={handleTerms}>Terms &amp;
                Conditions</a>
              </P>
              <P className="mb-2 mb-md-0 me-md-4 me-sm-5">
                <i className="fa fa-file-text" aria-hidden="true"></i><a className="clickable-link" onClick={handlePrivacy}> Privacy
                Policy</a>
              </P>
              <P className="mb-2 mb-md-0">
                <i className="fa fa-shopping-cart" aria-hidden="true"></i><a className="clickable-link" onClick={handleTerms}>
                Cancellation Policy</a>
              </P>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

