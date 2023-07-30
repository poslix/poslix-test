import { useEffect, useState } from "react";
import CloseRegister from "../modals/CloseRegister";
import Link from 'next/link';
import Router from 'next/router'
import en from 'en.json'
import ar from 'ar.json'

const NavMenu: any = (probs: any) => {
    const { shopId, lang, setLang } = probs;
    const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
    const customerModalHandler = (status: any) => {
        setCustomerIsModal(false)
    }
    // const [lang, setLang] = useState(localStorage.getItem('lang'))

    const defaultLang = localStorage.getItem('lang') || 'en'
    useEffect(() => {
        if(defaultLang == 'en') setLang(en)
        else setLang(ar)
    }, [defaultLang])
    return (
        <>
            <CloseRegister statusDialog={customerIsModal} openDialog={customerModalHandler} shopId={shopId} />
            <div className="app-menu navbar-menu">
                <div className="logo-box">
                    <img src="/images/poslix-sm.png" alt="" height={30} width={30} />
                </div>

                <div id="scrollbar">
                    {/* Back To List</Link> */}
                    <div className='nav-link menu-link sty_ar' style={{cursor: 'pointer'}} onClick={() => {
                        if(lang == en) {
                            localStorage.setItem('lang', 'ar'); setLang(ar)
                        }
                        else {
                            localStorage.setItem('lang', 'en'); setLang(en)
                        }
                    }}><i className="ri-global-fill"></i> <span>{lang == ar ? 'EN' : 'العربية'}</span> </div>
                    <Link className='nav-link menu-link' href={'/shop/' + shopId + '/products'}><i className="ri-dashboard-2-line"></i> <span data-key="t-dashboards">{lang.pos.navmenu.dashboard}</span> </Link>
                    <Link className='nav-link menu-link' href={'#'} onClick={() => setCustomerIsModal(true)}> <i className="ri-stack-line"></i> <span data-key="t-dashboards">{lang.pos.navmenu.close}</span> </Link>
                    <Link className='nav-link menu-link' href={'#'} onClick={() => Router.reload()}><i className="ri-refresh-line"></i> <span data-key="t-dashboards">{lang.pos.navmenu.refresh}</span> </Link>
                    <Link className='nav-link menu-link' href={'/user/login'}><i className="ri-logout-circle-line"></i> <span data-key="t-dashboards">{lang.pos.navmenu.logout}</span> </Link>
                </div>
            </div>
        </>
    )
}
export default NavMenu;
