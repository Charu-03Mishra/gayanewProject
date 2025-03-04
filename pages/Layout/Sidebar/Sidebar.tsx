// import { useAppDispatch, useAppSelector } from '../../ReduxToolkit/Hooks'
import LogoWrapper from './LogoWrapper';
import SimpleBar from 'simplebar-react';
import { ArrowLeft, ArrowRight } from 'react-feather';
import SidebarMenuList from './SidebarMenuList';
import LayoutSlice, { scrollToLeft, scrollToRight } from '@/ReduxToolkit/Reducers/LayoutSlice';
import Link from 'next/link';
import Image from '@/pages/components/media';
import LI from '@/pages/components/ListGroup/ListItem';
import UL from '@/pages/components/ListGroup/UnorderedList';
import H6 from '@/pages/components/headings/H6Element';
// import { AppDispatch, RootState } from "@/pages/ReduxToolkit/Store";
import { TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { configureStore } from '@reduxjs/toolkit';
import ThemeCustomizerSlice from '@/ReduxToolkit/Reducers/ThemeCustomizerSlice';

const Store = configureStore({
  reducer: {
    layout: LayoutSlice,
    themeCustomizer: ThemeCustomizerSlice
  },
});


type RootState = ReturnType<typeof Store.getState>;
type AppDispatch = typeof Store.dispatch;

const useAppDispatch: () => AppDispatch = useDispatch
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { layout } = useAppSelector((state) => state.themeCustomizer);
  const { toggleSidebar,margin } = useAppSelector((state: { layout: any; }) => state.layout);
  const { pinedMenu } = useAppSelector((state: { layout: any; }) => state.layout);
  
  return (
    <div className={`sidebar-wrapper ${!toggleSidebar ? "close_icon" : ""}`} id="sidebarwrappers">
      <LogoWrapper />
      <nav className="sidebar-main">
        <div className={`left-arrow ${margin === 0 ? "disabled" : ""}`} onClick={()=>dispatch(scrollToLeft())}><ArrowLeft /></div>
        <div id="sidebar-menu" style={{ marginLeft : layout === "horizontal-wrapper" ? `${margin}px` : "0px"}}>
          <UL className="sidebar-links" id="simple-bar">
            <SimpleBar style={{ width: "80px", height: "350px" }}>
              <LI className="back-btn">
                <Link href={`/comman_pages/dashboard`}>
                  <Image className="img-fluid" src="/assets/images/logo/logo-icon.png" alt="logo" />
                </Link>
                <div className="mobile-back text-end ">
                  <span>Back </span>
                  <i className="fa fa-angle-right ps-2" aria-hidden="true"></i>
                </div>
              </LI>
              <LI className={`pin-title sidebar-main-title ${pinedMenu.length > 1 ? "show" : ""} `}>
                <div>
                  <H6>Pinned</H6>
                </div>
              </LI>
             <SidebarMenuList />
            </SimpleBar>
          </UL> 
        </div>
        <div className={`right-arrow ${margin === -3500 ? "disabled" : ""}`} onClick={()=>dispatch(scrollToRight())}><ArrowRight /></div>
      </nav>
    </div>
  )
}

export default Sidebar