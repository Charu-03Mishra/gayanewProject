import Image from "@/pages/components/media";
import Link from "next/link";

const HeaderLogo = () => {
  return (
    <div className="header-logo-wrapper col-auto">
        <div className="logo-wrapper">
            <Link href={"/"}>
                <Image className="img-fluid for-light" src="/assets/images/logo/logo_light.png" alt="logo"/>
            </Link>
        </div>
    </div>
  );
};

export default HeaderLogo;
