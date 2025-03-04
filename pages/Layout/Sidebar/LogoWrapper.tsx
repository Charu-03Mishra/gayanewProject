import LayoutSlice, {
  handleResponsiveToggle,
  setToggleSidebar,
} from "@/ReduxToolkit/Reducers/LayoutSlice";
import Link from "next/link";
import SVG from "@/pages/components/SVG";
import Image from "@/pages/components/media";
import { TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ThemeCustomizerSlice from "@/ReduxToolkit/Reducers/ThemeCustomizerSlice";
import localStorage from "@/utils/localStorage";

const Store = configureStore({
  reducer: {
    layout: LayoutSlice,
    themeCustomizer: ThemeCustomizerSlice,
  },
});

type RootState = ReturnType<typeof Store.getState>;
type AppDispatch = typeof Store.dispatch;

const useAppDispatch: () => AppDispatch = useDispatch;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const LogoWrapper = () => {
  const dispatch = useAppDispatch();
  const role = localStorage.getItem("role");
  const { toggleSidebar } = useAppSelector<any>((state) => state.layout);
  const { sidebarIconType } = useAppSelector((state) => state.themeCustomizer);

  return (
    <>
      <div className="logo-wrapper">
        <Link
          href={
            role === "admin"
              ? "/dashboard"
              : role === "vendor"
              ? "/comman_pages/expense/list_expense"
              : "/comman_pages/dashboard"
          }
        >
          <Image
            className="img-fluid"
            src="/assets/images/logo/logo_light.png"
            alt="logo"
          />
        </Link>

        <div
          className="back-btn"
          onClick={() => dispatch(handleResponsiveToggle())}
        >
          <i className="fa fa-angle-left"></i>
        </div>
        <div className="toggle-sidebar">
          <SVG
            className={`${sidebarIconType}-icon sidebar-toggle status_toggle middle`}
            iconId={`${sidebarIconType === "fill" ? "fill-" : ""}toggle-icon`}
            onClick={() => dispatch(setToggleSidebar(!toggleSidebar))}
          />
        </div>
      </div>
      <div className="logo-icon-wrapper">
        <Link href={`/comman_pages/members/list_members`}>
          <Image
            className="img-fluid"
            src="/assets/images/logo/logo_light.png"
            alt="logo"
          />
        </Link>
      </div>
    </>
  );
};

export default LogoWrapper;
