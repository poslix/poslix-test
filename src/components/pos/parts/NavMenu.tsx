import { useState } from "react";
import CloseRegister from "../modals/CloseRegister";
import Link from 'next/link';
import Router from 'next/router'


const NavMenu: any = (probs: any) => {
    const { shopId } = probs;

    const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
    const customerModalHandler = (status: any) => {
        setCustomerIsModal(false)
    }
    return (
        <>
            <CloseRegister statusDialog={customerIsModal} openDialog={customerModalHandler} shopId={shopId} />
            <div className="app-menu navbar-menu">
                <div className="logo-box">
                    <img src="/images/poslix-sm.png" alt="" height={30} width={30} />
                </div>

                <div id="scrollbar">
                    {/* Back To List</Link> */}
                    <Link className='nav-link menu-link' href={'/shop/' + shopId + '/products'}><i className="ri-dashboard-2-line"></i> <span data-key="t-dashboards">Dashboard</span> </Link>
                    <Link className='nav-link menu-link' href={'#'} onClick={() => setCustomerIsModal(true)}> <i className="ri-stack-line"></i> <span data-key="t-dashboards">Close</span> </Link>
                    <Link className='nav-link menu-link' href={'#'} onClick={() => Router.reload()}><i className="ri-refresh-line"></i> <span data-key="t-dashboards">Refresh</span> </Link>
                    <Link className='nav-link menu-link' href={'/user/login'}><i className="ri-logout-circle-line"></i> <span data-key="t-dashboards">Log Out</span> </Link>
                </div>
            </div>
        </>
    )
}
export default NavMenu;
