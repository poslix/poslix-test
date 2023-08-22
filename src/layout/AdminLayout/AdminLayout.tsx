import React, { useContext, useCallback, useEffect, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import Head from "next/head";
import Sidebar, { SidebarOverlay } from "@layout/AdminLayout/Sidebar/Sidebar";
import Header from "@layout/AdminLayout/Header/Header";
import Footer from "@layout/AdminLayout/Footer/Footer";
import Breadcrumb from "@layout/AdminLayout/Breadcrumb/Breadcrumb";
import { UserContext } from "src/context/UserContext";
import Script from "next/script";
import { darkModeContext } from "../../context/DarkModeContext";

export default function AdminLayout({ children, shopId }: any) {
  /*MOHAMMED MAHER */
  const { darkMode } = useContext(darkModeContext);

  // Show status for xs screen
  const [isShowSidebar, setIsShowSidebar] = useState(false);

  const { setLocationSettings } = useContext(UserContext);
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

  useEffect(() => {
    const _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    var script = document.createElement("script");
    script.src = "https://poslix2-uee0.onrender.com/index.js";
    document.head.appendChild(script);
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
  }, []);

  return (
    <>
     
      <div ref={ref} className="position-absolute w-100" />

      <Sidebar
        shopId={shopId}
        isOwner={false}
        isShow={isShowSidebar}
        isShowMd={isShowSidebarMd}
      />

      <div
        className={`wrapper d-flex flex-column min-vh-100 ${
          darkMode ? "dark-mode-body" : "light-mode-body"
        }`}
      >
        <Header
          toggleSidebar={toggleIsShowSidebar}
          toggleSidebarMd={toggleIsShowSidebarMd}
        />
        <Breadcrumb shopId={shopId} />
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
