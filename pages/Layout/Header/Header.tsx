import { Col, Row } from "reactstrap";
import HeaderLogo from "./HeaderLogo";
import HeaderLogoWrapper from "./HeaderLogoWrapper/HeaderLogoWrapper";
import RightHeader from "./RightHeader/RightHeader";
// import { useAppSelector } from "../../ReduxToolkit/Hooks";
import CommonBreadcrumb from "@/pages/components/CommonBreadcrumb/CommonBreadcrumb";
// import { RootState } from "@/pages/ReduxToolkit/Store";
import { TypedUseSelectorHook } from "react-redux";
import { useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LayoutSlice from "@/ReduxToolkit/Reducers/LayoutSlice";
import ThemeCustomizerSlice from "@/ReduxToolkit/Reducers/ThemeCustomizerSlice";

const Store = configureStore({
	reducer: {
		layout: LayoutSlice,
		themeCustomizer: ThemeCustomizerSlice,
	},
});

type RootState = ReturnType<typeof Store.getState>;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const Header = () => {
	const { toggleSidebar, scroll } = useAppSelector(
		(state: any) => state.layout
	);
	return (
		<Row
			className={`page-header ${!toggleSidebar ? "close_icon" : ""}`}
			id="pageheaders"
			style={{ display: scroll ? "none" : "" }}>
			<HeaderLogo />
			<CommonBreadcrumb />
			<Col className="header-wrapper m-0 ">
				<Row>
					<HeaderLogoWrapper />
					<RightHeader />
				</Row>
			</Col>
		</Row>
	);
};

export default Header;

