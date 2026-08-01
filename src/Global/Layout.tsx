import * as React from "react";

import { Outlet } from "react-router-dom";
import GlobalSideNav from "../Navigation/GlobalSideNav";
import GlobalTopNav from "../Navigation/GlobalTopNav";
import '@fortawesome/fontawesome-free/css/all.min.css';

// import { Helmet } from 'react-helmet-async';

import "notyf/notyf.min.css";
import Modal from "../Modals/Modal";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap/dist/css/bootstrap.min.css";

import '../Assets/css/sharepointuifix.css';
import "../Assets/css/style.css";

require("speedpoint_core");
require("workflowengine");
require("global");
require("notyf");
require("jQueryUI");
require("globalext");
require("select2");


export const Layout = () => {
    // Sidebar open/closed state lives here so both GlobalTopNav (the button
    // that opens it) and GlobalSideNav (the panel + overlay that close it)
    // can read and update the same value. CSS expects .AdrSidebar.open and
    // .AdrSidebarOverlay.show below the 900px breakpoint (see style.css).
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <>
            <div className="AdrApp">
                <GlobalSideNav isOpen={isSidebarOpen} onClose={closeSidebar} />
                <div className="AdrMain">
                    <GlobalTopNav onToggleSidebar={toggleSidebar} />
                    <main className="AdrPageContent" id="main-content" tabIndex={-1}>
                        <Outlet />
                    </main>
                </div>
            </div>
            <Modal />
        </>
    );
};


export default Layout;