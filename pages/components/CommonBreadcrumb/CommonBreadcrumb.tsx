import { Breadcrumb, BreadcrumbItem, Col } from 'reactstrap';
import FeatherIcons from '../FeatherIcon/FeatherIcon';
import H4 from '../headings/H4Element';
import Link from 'next/link';
import { useRouter } from 'next/router';
import localStorage from '@/utils/localStorage';

const CommonBreadcrumb = () => {
  const router = useRouter();
  const { pathname } = router;
  const role = localStorage.getItem("role");
  const parts = pathname.split("/").slice(1);
  // const firstPart = parts[0];
  const secondPart = parts[0];
  const thirdPart = parts[1];

  return (
    <Col xs="4" xl="4" className="page-title">
      <H4 className="f-w-700 text-capitalize">{thirdPart ? thirdPart.replaceAll("_", " ") : (secondPart ? secondPart.replaceAll("_", " ") : "")}</H4>
      <Breadcrumb>
        <BreadcrumbItem >
        <Link
          href={
            role === "admin"
              ? "/dashboard"
              : role === "vendor"
              ? "/comman_pages/expense/list_expense"
              : "/comman_pages/dashboard"
          }
        >
            <FeatherIcons iconName="Home" />
          </Link>
        </BreadcrumbItem>
        {/* <BreadcrumbItem className="f-w-400 text-capitalize">{firstPart ? firstPart.replaceAll("_"," ") : ''}</BreadcrumbItem> */}
        {/* <BreadcrumbItem className={`f-w-400 ${!thirdPart ?"active" : ""}`}>{secondPart ? secondPart.replaceAll("_"," ") : ''}</BreadcrumbItem> */}
        {thirdPart && <BreadcrumbItem className="f-w-400 active">{thirdPart.replaceAll("_", " ")}</BreadcrumbItem>}
      </Breadcrumb>
    </Col>
  );
};

export default CommonBreadcrumb;
