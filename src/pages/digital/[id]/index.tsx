import { NextPage } from "next";

import img1 from "../logo1.png"
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import * as cookie from 'cookie';
import { hasPermissions, isNumber, keyValueRules, locationPermission, verifayTokens } from "src/pages/api/checkUtils";
import { ITokenVerfy } from "@models/common-model";
import { Container } from "react-bootstrap";

const Digital: NextPage = (probs: any) => {

    const { shopId } = probs;
    const products = [{ name: "prod1", description: "" }]


    return (
        <>
            <Container>
                <div className="page-content-style justfy-center">
                    <Image src={img1} alt={""} />
                    <h2>Poslix @poslix.com</h2>
                    <p>@poslix</p>
                    <p>Pos, ecommirce, and more</p>
                    <div className="digital-big-btn">
                        <Link className="digital-big-btn-link" href={"/digital/" + shopId + "/products"}><span>View Products</span></Link>
                    </div>
                    <div className="digital-socials">
                        <FontAwesomeIcon className="icon-clicable" icon={faWhatsapp} />
                        <FontAwesomeIcon className="icon-clicable" icon={faInstagram} />
                    </div>
                </div>
            </Container>
        </>
    )
}

export default Digital;

export async function getServerSideProps(context: any) {
    const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
    var _isOk = true,
        _hasPer = true,
        locHasAccess = false;
    //check page params
    var shopId = context.query.id;
    if (shopId == undefined) return { redirect: { permanent: false, destination: '/page403' } };
    if (!isNumber(shopId)) return { redirect: { permanent: false, destination: '/page403' } };
    //check user permissions
    var _userRules = {};
    await verifayTokens(
        { headers: { authorization: 'Bearer ' + parsedCookies.tokend } },
        (repo: ITokenVerfy) => {
            _isOk = repo.status;
            if (locationPermission(repo.data.locs, shopId) != -1) locHasAccess = true;
            else if (_isOk) {
                var _rules = keyValueRules(repo.data.rules || []);
                if (
                    _rules[-2] != undefined &&
                    _rules[-2][0].stuff != undefined &&
                    _rules[-2][0].stuff == 'owner'
                ) {
                    _hasPer = true;
                    _userRules = {
                        hasDelete: true,
                        hasEdit: true,
                        hasView: true,
                        hasInsert: true,
                    };
                } else if (_rules[shopId] != undefined) {
                    var _stuf = '';
                    _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
                    const { userRules, hasPermission } = hasPermissions(_stuf, 'products');
                    _hasPer = hasPermission;
                    _userRules = userRules;
                } else _hasPer = false;
            }
        }
    );
    if (!locHasAccess) return { redirect: { permanent: false, destination: '/page403' } };
    if (!_isOk) return { redirect: { permanent: false, destination: '/user/auth' } };
    if (!_hasPer) return { redirect: { permanent: false, destination: '/page403' } };
    return {
        props: { shopId: context.query.id, rules: _userRules },
    };
}