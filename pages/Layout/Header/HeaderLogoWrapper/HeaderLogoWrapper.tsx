// import { useAppDispatch, useAppSelector } from "../../../ReduxToolkit/Hooks";
import LayoutSlice, { setToggleSidebar } from "@/ReduxToolkit/Reducers/LayoutSlice";
import Link from "next/link";
import SVG from "@/pages/components/SVG";
import Image from "@/pages/components/media";
// import { AppDispatch, RootState } from "@/pages/ReduxToolkit/Store";
import { TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ThemeCustomizerSlice from "@/ReduxToolkit/Reducers/ThemeCustomizerSlice";

const Store = configureStore({
  reducer: {
    layout: LayoutSlice,
    themeCustomizer: ThemeCustomizerSlice,
  },
});


type RootState = ReturnType<typeof Store.getState>;
type AppDispatch = typeof Store.dispatch;

const useAppDispatch: () => AppDispatch = useDispatch
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

const HeaderLogoWrapper = () => {
  const dispatch = useAppDispatch();
  const { toggleSidebar } = useAppSelector<any>((state) => state.layout)
  return (
    <div className="header-logo-wrapper col-auto p-0">
      <div className="logo-wrapper">
        <Link href={"/"}>
          <Image className="img-fluid" src="/assets/images/logo/logo_light.png" alt="MofiLogo" />
        </Link>
      </div>
      <div className="toggle-sidebar">
        <SVG className="stroke-icon sidebar-toggle status_toggle middle" iconId={"toggle-icon"} onClick={() => dispatch(setToggleSidebar(!toggleSidebar))}></SVG>
      </div>
    </div>
  );
};

export default HeaderLogoWrapper;
