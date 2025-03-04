import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { configureStore } from "@reduxjs/toolkit";
import LayoutSlice from "@/ReduxToolkit/Reducers/LayoutSlice";
import ThemeCustomizerSlice from "@/ReduxToolkit/Reducers/ThemeCustomizerSlice";
import Layout from "./components/Layout";
// import Store from "./ReduxToolkit/Store";

const Store = configureStore({
  reducer: {
    layout: LayoutSlice,
    themeCustomizer: ThemeCustomizerSlice,
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Provider store={Store}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ToastContainer />
      </Provider>
    </>
  );
}
