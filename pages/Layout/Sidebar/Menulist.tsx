import React, { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "../../ReduxToolkit/Hooks";
import LayoutSlice, { handlePined } from "@/ReduxToolkit/Reducers/LayoutSlice";
import UL from "@/pages/components/ListGroup/UnorderedList";
import SVG from "@/pages/components/SVG";
import LI from "@/pages/components/ListGroup/ListItem";
import { useRouter } from "next/router";
import { TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ThemeCustomizerSlice from "@/ReduxToolkit/Reducers/ThemeCustomizerSlice";
import dynamic from "next/dynamic";

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

interface SidebarChildrenType {
  path?: string;
  title: string;
  type: string;
  lanClass?: string;
  children?: SubChildrenType[];
}

interface SubChildrenType {
  title: string;
  type: string;
  path: string;
}
interface MenuListType {
  menu?: MenuItem[] | undefined;
  level: number;
  className?: string;
  setActiveMenu: Function;
  activeMenu: unknown[];
}
interface SidebarItemTypes {
  item: {
    id?: number;
    title?: string | undefined;
    icon?: string;
    type?: string;
    active?: boolean;
    path?: string;
    children?: SidebarChildrenType[];
    lanClass?: string;
  };
}
interface MenuItem {
  title: string;
  lanClass?: string;
  menucontent?: string;
  Items?: MenuItem[];
  id?: number;
  icon?: string;
  type?: string;
  active?: boolean;
  children?: MenuItem[];
  path?: string;
  mainTitle?: string;
  bookmark?:boolean
}
const DynamicLink = dynamic(() => import('next/link'));

const Menulist: React.FC<MenuListType> = ({ menu,setActiveMenu,activeMenu,level,className}) => {
  const { pinedMenu } = useAppSelector<any>((state) => state.layout);
  const { sidebarIconType } = useAppSelector((state) => state.themeCustomizer)
  const location = useRouter();
  const dispatch = useAppDispatch();

  const ActiveNavLinkUrl = (path?: string, active?: boolean) => {
    return location.pathname === path ? (active ? active : true) : "";
  };

  const shouldSetActive = ({ item }: SidebarItemTypes) => {
    var returnValue = false;
    if (item?.path === location.pathname) returnValue = true;
    if (!returnValue && item?.children) {
      item?.children.every((subItem) => {
        returnValue = shouldSetActive({ item: subItem });
        return !returnValue;
      });
    }
    return returnValue;
  };
  const handleClick = ((item: string) => {
    const temp = activeMenu;
    temp[level] = item !== temp[level] ? item : "";
    setActiveMenu([...temp]);
  })
  useEffect(() => {
    if (menu instanceof Array) {
    menu?.forEach((item: any) => {
      let gotValue = shouldSetActive({ item });
      if (gotValue) {
        let temp = [...activeMenu];
        temp[level] = item.title;
        setActiveMenu(temp);
      }
    });
  }
  }, []);

  return (
    <>
       {menu instanceof Array && menu.map((item: any, index: any) => (
        <LI
          key={index}
          className={`${level === 0 ? "sidebar-list" : ""} ${ pinedMenu.includes(item.title || "") ? "pined" : ""}  
          ${(item.children
              ? item.children.map((innerItem: any) => ActiveNavLinkUrl(innerItem.path)).includes(true)
              : ActiveNavLinkUrl(item.path)) || activeMenu[level] === item.title
              ? "active"
              : ""
          } `}
        >
          {level === 0 && (<i className="fa fa-thumb-tack" onClick={() => dispatch(handlePined(item.title))} ></i>)}
          <DynamicLink
            className={`${!className && level !== 2 ? "sidebar-link sidebar-title" : ""} 
            ${(item.children
                ? item.children.map((innerItem: any) => ActiveNavLinkUrl(innerItem.path)).includes(true)
                : ActiveNavLinkUrl(item.path)) || activeMenu[level] === item.title ? "active" : ""
            }`}
            href={item.path ? item.path : "" }
            replace
            onClick={() => handleClick(item.title)}
          >
            {item.icon && (
              <SVG className={`${sidebarIconType}-icon`} iconId={`${sidebarIconType}-${item.icon}`} />
            )}
            <span className={item.lanClass && item.lanClass}>{(item.title)}</span>
            {item.children && (activeMenu[level] === item.title ? (
              <div className="according-menu">
                <i className="fa fa-angle-down" />
              </div>
            ) : (
              <div className="according-menu">
                <i className="fa fa-angle-right" />
              </div>
            ))}
          </DynamicLink>
          {item.children && (
            <UL className={`simple-list ${ level !== 0 ? "nav-sub-childmenu submenu-content" : "sidebar-submenu " }`}
              style={{
                display: `${
                  (item.children
                    ? item.children.map((innerItem: any) => ActiveNavLinkUrl(innerItem.path)).includes(true) : ActiveNavLinkUrl(item.path)) || activeMenu[level] === item.title ? "block" : "none"
                }`
              }}
            >
              <Menulist menu={item.children} activeMenu={activeMenu} setActiveMenu={setActiveMenu} level={level + 1} className="sidebar-submenu" />
            </UL>
          )}
        </LI>
      ))}
    </>
  );
};

export default Menulist;