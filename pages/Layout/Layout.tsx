// import { useAppDispatch, useAppSelector } from '../ReduxToolkit/Hooks'
import Footer from './Footer/Footer'
import Header from './Header/Header'
import Loader from './Loader/Loader'
import Sidebar from './Sidebar/Sidebar'
import TapTop from './TapTop/TapTop'
import LayoutSlice, { setToggleSidebar } from '@/ReduxToolkit/Reducers/LayoutSlice'
import { useEffect } from 'react'
import ThemeCustomizerSlice, { setLayout } from '@/ReduxToolkit/Reducers/ThemeCustomizerSlice'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
// import { AppDispatch, RootState } from '../ReduxToolkit/Store'
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

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {layout} = useAppSelector((state: any) => state.themeCustomizer);
  const dispatch = useAppDispatch();

  const compactSidebar = () => {
    let windowWidth = window.innerWidth;
    if (layout === "compact-wrapper") {
      if (windowWidth < 1200) {
        dispatch(setToggleSidebar(false));
      } else {
        dispatch(setToggleSidebar(false));
      }
    } else if (layout === "horizontal-wrapper") {
      if (windowWidth < 992) {
        dispatch(setToggleSidebar(true));
        dispatch(setLayout("compact-wrapper"));
      } else {
        dispatch(setToggleSidebar(false));
        dispatch(setLayout(localStorage.getItem("layout")));
      }
    }
  };

  useEffect(() => {
    compactSidebar();
    window.addEventListener("resize", () => {
      compactSidebar();
    });

    return () => {
      window.removeEventListener("resize", () => {
        compactSidebar();
      });
    };
  }, [layout]);

  return (
    <>
       <Loader />
      <TapTop />
      <div className={`page-wrapper ${layout}`}>
        <Header />
        <div className="page-body-wrapper">
          <Sidebar />
          {children}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Layout;