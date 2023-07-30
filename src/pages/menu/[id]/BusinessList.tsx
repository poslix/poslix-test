import { useEffect, useState, useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Router, { useRouter } from "next/router";
import { FetchUserShops } from "src/utils/FetchUserShops";
// import { ShopsContext } from '../contexts/ShopsContext';
import { ShopSelectedContext } from "src/context/ShopSelectedContext";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
// import { ColorRing } from 'react-loader-spinner'
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import moment from "moment";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
// import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from "react-confetti";
// import { LangContext } from '../contexts/LangContext';
// import { lang } from "../Lang/lang";
import { ShopsContext } from "src/context/ShopsContext";
export const TaxRow = ({ shop, int }) => {
  const { setSelectedShop } = useContext(ShopSelectedContext);
  const router = useRouter();
  // const { language, setLanguage } = useContext(LangContext);

  function toBusinessDashboard() {
    setSelectedShop(int);
    router.push("/dashboard");
  }

  if (!shop) return null;

  const subscription = shop != null ? shop.subscription : null;
  let subscriptionBadge: {};

  //new Date(moment().format("YYYY-MM-DD ") > new Date(subscription.end_date)
  // if (!subscription || subscription.sid === 0 || subscription.status != 1 || new Date(moment().format("YYYY-MM-DD ")) > new Date(subscription.end_date)) {
  // 	subscriptionBadge = <Tooltip title="Subscription (Free)" placement="right">
  // 		{/* <div className="subscription-badge lite">{lang(language, "subscription_badge_lite")}</div> */}
  // 	</Tooltip>;
  // } else if (subscription.sid === 1) {
  // 	subscriptionBadge = <Tooltip title="Subscription" placement="right">
  // 		{/* <div className="subscription-badge pro">{lang(language, "subscription_badge_pro")}</div> */}
  // 	</Tooltip>;
  // } else if (subscription.sid === 2) {
  // 	subscriptionBadge = <Tooltip title="Subscription" placement="right">
  // 		{/* <div className="subscription-badge ultimate">{lang(language, "subscription_badge_ultimate")}</div> */}
  // 	</Tooltip>;
  // } else {
  // 	subscriptionBadge = <Tooltip title="Subscription" placement="right">
  // 		{/* <div className="subscription-badge elite">{lang(language, "subscription_badge_elite")}</div> */}
  // 	</Tooltip>;
  // }

  return (
    <>
      {shop ? (
        <div className="bizz-list-row">
          <div className="bizz-list-info">
            <span className="bizz-list-info-title">
              <StoreOutlinedIcon style={{ opacity: "0.8" }} />
              <h3>{shop.name}</h3>
              {/* {subscriptionBadge} */}
            </span>

            {shop.about_short != null && shop.about_short != "" ? (
              <p
                style={{
                  maxWidth: "100%",
                  fontSize: "14px",
                  marginLeft: "3px",
                }}
              >
                {shop.about_short}
              </p>
            ) : (
              ""
            )}

            <div className="bizz-list-info-misc">
              {shop.status == 1 ? (
                <>
                  <Tooltip title="Status" placement="right">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        color="secondary"
                        aria-label="delete"
                        style={{ padding: "5px" }}
                      >
                        <FiberManualRecordIcon
                          className="remove-filter"
                          style={{
                            width: "12px",
                            height: "12px",
                            color: "green",
                          }}
                        />
                      </IconButton>
                      {/* {lang(language, "active")} */}
                    </div>
                  </Tooltip>
                  <Tooltip title="View menu" placement="right">
                    <a
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      href={`https://menu.qrlix.com/${shop.username}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <IconButton
                        color="secondary"
                        aria-label="delete"
                        style={{ padding: "5px" }}
                      >
                        <OpenInNewIcon
                          className="remove-filter"
                          style={{ width: "12px", height: "12px" }}
                        />
                      </IconButton>
                      {/* {lang(language, "view_menu")} */}
                    </a>
                    {/**new Date(moment().format("YYYY-MM-DD ")) > new Date(subscription.end_date) */}
                  </Tooltip>
                  {subscription != null && subscription.sid === 0 ? (
                    ""
                  ) : subscription != null ? (
                    new Date(moment().format("YYYY-MM-DD ")) >
                    new Date(subscription.end_date) ? (
                      <Tooltip
                        title="Your previous subscription expired. Renew your subscription to continue enjoying the full features of QRLIX"
                        placement="right"
                      >
                        <a
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                          target="_blank"
                        >
                          <IconButton
                            color="secondary"
                            aria-label="delete"
                            style={{ padding: "5px" }}
                          >
                            <ErrorOutlineOutlinedIcon
                              className="remove-filter"
                              style={{
                                width: "14px",
                                height: "14px",
                                color: "#ff9800",
                              }}
                            />
                          </IconButton>
                          {/* {lang(language, "subscription_expired")} */}
                        </a>
                      </Tooltip>
                    ) : subscription != null && subscription.status == 4 ? (
                      <Tooltip
                        title="Complete your payment to activate your subscription. Your business will be on the Lite (free) package until you complete the payment"
                        placement="right"
                      >
                        <a
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                          target="_blank"
                        >
                          <IconButton
                            color="secondary"
                            aria-label="delete"
                            style={{ padding: "5px" }}
                          >
                            <ErrorOutlineOutlinedIcon
                              className="remove-filter"
                              style={{
                                width: "14px",
                                height: "14px",
                                color: "#ff9800",
                              }}
                            />
                          </IconButton>
                          {subscription.invoice_status == 0
                            ? "Pending payment"
                            : ""}
                        </a>
                      </Tooltip>
                    ) : subscription != null && subscription.status == 2 ? (
                      <Tooltip
                        title="You subscription is on-hold due to a billing issue. Please contact us and we will be happy to assist you"
                        placement="right"
                      >
                        <a
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                          target="_blank"
                        >
                          <IconButton
                            color="secondary"
                            aria-label="delete"
                            style={{ padding: "5px" }}
                          >
                            <ErrorOutlineOutlinedIcon
                              className="remove-filter"
                              style={{
                                width: "14px",
                                height: "14px",
                                color: "#ff9800",
                              }}
                            />
                          </IconButton>
                          {/* {lang(language, "subscription_onhold")}{" "} */}
                          {subscription.status_msg != ""
                            ? `(${subscription.status_msg})`
                            : "(Billing)"}
                        </a>
                      </Tooltip>
                    ) : subscription != null && subscription.status == 3 ? (
                      <Tooltip
                        title="You subscription is on-hold due to a breach to our terms and conditions. Please contact us and we will be happy to assist you"
                        placement="right"
                      >
                        <a
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                          target="_blank"
                        >
                          <IconButton
                            color="secondary"
                            aria-label="delete"
                            style={{ padding: "5px" }}
                          >
                            <ErrorOutlineOutlinedIcon
                              className="remove-filter"
                              style={{
                                width: "14px",
                                height: "14px",
                                color: "#ff9800",
                              }}
                            />
                          </IconButton>
                          {/* {lang(language, "subscription_onhold")}{" "} */}
                          {subscription.status_msg != ""
                            ? `(${subscription.status_msg})`
                            : "(Terms breach)"}
                        </a>
                      </Tooltip>
                    ) : subscription != null && subscription.status == 5 ? (
                      <Tooltip
                        title="You cancelled your subscription. If you are facing any issues please contact us and we will be happy to assist you"
                        placement="right"
                      >
                        <a
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                          target="_blank"
                        >
                          <IconButton
                            color="secondary"
                            aria-label="delete"
                            style={{ padding: "5px" }}
                          >
                            <ErrorOutlineOutlinedIcon
                              className="remove-filter"
                              style={{
                                width: "14px",
                                height: "14px",
                                color: "#ff9800",
                              }}
                            />
                          </IconButton>
                          {/* {lang(language, "subscription_cancelled_by_you")} */}
                        </a>
                      </Tooltip>
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  )}
                </>
              ) : (
                <Tooltip title="Status" placement="right">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      color="secondary"
                      aria-label="delete"
                      style={{ padding: "5px" }}
                    >
                      <FiberManualRecordIcon
                        className="remove-filter"
                        style={{ width: "12px", height: "12px", color: "red" }}
                      />
                    </IconButton>
                    {/* {lang(language, "disabled")} */}
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="bizz-list-actions">
            <div style={{ display: "flex", alignItems: "center" }}>
              <Tooltip title="Manage Business" placement="right">
                <IconButton
                  className="bizz-action-btn"
                  color="secondary"
                  aria-label="delete"
                  style={{ padding: "5px", fontSize: "14px" }}
                  onClick={toBusinessDashboard}
                >
                  <SettingsOutlinedIcon
                    className="remove-filter"
                    style={{ width: "16px", height: "16px" }}
                  />
                  {/* {lang(language, "manage")} */}
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export const BusinessList = (props) => {
  //   const { width, height } = useWindowSize();
  //   const { language } = useContext(LangContext);

  const { user } = props;

  const router = useRouter();
  const { created } = router.query;

  const { userShops, setUserShops } = useContext(ShopsContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  useEffect(() => {
    async function fetchShopInfo() {
      setIsLoading(true);
      setUserShops(await FetchUserShops());
      setIsLoading(false);
      if (
        created &&
        created != null &&
        created != undefined &&
        created == "1"
      ) {
        displayConfetti();
      }
    }
    fetchShopInfo();
  }, []);

  function displayConfetti() {
    setIsConfettiActive(true);
    const timer = setTimeout(() => {
      setIsConfettiActive(false);
    }, 20000);
  }

  return (
    <>
      <div className="setting-subpage">
        {isConfettiActive ? (
          <Confetti
            // width={width * 0.9}
            // height={height * 0.9}
            width={400}
            height={400}
            numberOfPieces={100}
            recycle={false}
            gravity={0.1}
            initialVelocityX={-40}
            initialVelocityY={-10}
          />
        ) : (
          ""
        )}
        <div className="title-box">
          {/* <h2>{lang(language, "overview")}</h2> */}
          <span
            style={{
              display: "flex",
              width: "100%",
              margin: "0",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* {lang(language, "your_businesses")} */}
            <div style={{ display: "flex", columnGap: "10px" }}>
              <Tooltip title="Your account settings" placement="right">
                <IconButton
                  color="secondary"
                  aria-label="delete"
                  style={{
                    padding: "5px",
                    color: "inherit",
                    fontSize: "12px",
                    fontWeight: "400",
                  }}
                  onClick={() => Router.push("/user")}
                >
                  <ManageAccountsOutlinedIcon style={{ color: "inherit" }} />
                </IconButton>
              </Tooltip>
              {user != null && user.is_staff == 0 ? (
                <Tooltip title="Add new business" placement="right">
                  <IconButton
                    color="secondary"
                    aria-label="delete"
                    style={{
                      padding: "5px",
                      color: "inherit",
                      fontSize: "15px",
                      fontWeight: "400",
                      columnGap: "5px",
                      borderRadius: "4px",
                    }}
                    onClick={() => Router.push("/create/business")}
                  >
                    <AddCircleOutlineOutlinedIcon
                      style={{ color: "inherit" }}
                    />
                    {/* {lang(language, "new")} */}
                  </IconButton>
                </Tooltip>
              ) : (
                ""
              )}
            </div>
          </span>
        </div>
        {user != null && isLoading == false ? (
          <div className="setting-inside">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "15px",
              }}
            >
              {userShops.length > 0 ? (
                userShops.map((val, idx) => (
                  <TaxRow key={idx} shop={val} int={idx} />
                ))
              ) : user.is_verify_email == 1 || user.is_verify_phone == 1 ? (
                <div className="bizz-list-row">
                  <a
                    onClick={() => Router.push("/create/business")}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      flexDirection: "column",
                    }}
                  >
                    <h2 style={{ margin: "15px 0" }}>
                      {/* {lang(language, "create_your_first_business")}{" "} */}
                    </h2>
                    <button className="large-btn" type="button">
                      {/* {lang(language, "create_business")} */}
                    </button>
                  </a>
                </div>
              ) : (
                <div className="bizz-list-row">
                  <a
                    onClick={() => Router.push("/auth/verify")}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      flexDirection: "column",
                    }}
                  >
                    <h2 style={{ margin: "15px 0" }}>
                      {/* {lang(language, "verify_to_create_business")} */}
                    </h2>
                    <button className="large-btn" type="button">
                      {/* {lang(language, "verify")} */}
                    </button>
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="loader">
            {/* <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="blocks-loading"
              wrapperStyle={{}}
              wrapperClass="blocks-wrapper"
              colors={["#E15BCF", "#EAD1A2", "#F86A6A", "#81BDB6", "#9B8984"]}
            /> */}
          </div>
        )}
      </div>
    </>
  );
};

export default BusinessList;
