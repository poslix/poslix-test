import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useContext,
  useState,
} from "react";
import { useResizeDetector } from "react-resize-detector";
import Head from "next/head";
import Sidebar, { SidebarOverlay } from "@layout/AdminLayout/Sidebar/Sidebar";
import Header from "@layout/AdminLayout/Header/Header";
import Footer from "@layout/AdminLayout/Footer/Footer";
import Script from "next/script";
import { darkModeContext } from "src/context/DarkModeContext";

export default function OwnerAdminLayout({ children }: PropsWithChildren) {
  /*MOHAMMED MAHER */
  const { darkMode } = useContext(darkModeContext);

  // Show status for xs screen
  const [isShowSidebar, setIsShowSidebar] = useState(false);

  // Show status for md screen and above
  const [isShowSidebarMd, setIsShowSidebarMd] = useState(true);

  const toggleIsShowSidebar = () => {
    setIsShowSidebar(!isShowSidebar);
  };

  const toggleIsShowSidebarMd = () => {
    const newValue = !isShowSidebarMd;

    localStorage.setItem("isShowSidebarMd", newValue ? "true" : "false");
    setIsShowSidebarMd(newValue);
  };

  // Clear and reset sidebar
  const resetIsShowSidebar = () => {
    setIsShowSidebar(false);
  };

  const onResize = useCallback(() => {
    resetIsShowSidebar();
  }, []);

  const { ref } = useResizeDetector({ onResize });

  // On first time load only
  useEffect(() => {
    if (localStorage.getItem("isShowSidebarMd")) {
      setIsShowSidebarMd(localStorage.getItem("isShowSidebarMd") === "true");
    }
  }, [setIsShowSidebarMd]);

  return (
    <>
      <Head>
        <title>Owner Dashboard</title>
      </Head>
      <div ref={ref} className="position-absolute w-100" />

      <Sidebar
        isOwner={true}
        isShow={isShowSidebar}
        isShowMd={isShowSidebarMd}
        shopId={0}
      />
      <Script src="https://poslix2-uee0.onrender.com/index.js" async />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <Header
          toggleSidebar={toggleIsShowSidebar}
          toggleSidebarMd={toggleIsShowSidebarMd}
        />
        <div
          className={`body body-container ${
            darkMode ? "dark-mode-body" : "light-mode-body"
          }`}
        >
          {children}
        </div>

        <Footer />
      </div>

      <SidebarOverlay
        isShowSidebar={isShowSidebar}
        toggleSidebar={toggleIsShowSidebar}
      />
      <Script src="https://unpkg.com/scrollreveal@4.0.0/dist/scrollreveal.min.js"></Script>
      <Script src="https://bootstrap-js.onrender.com/index.js" async />
    </>
  );
}
