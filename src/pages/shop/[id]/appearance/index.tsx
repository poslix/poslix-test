import type { NextPage } from "next";
import { AdminLayout } from "@layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCancel } from "@fortawesome/free-solid-svg-icons";
import { Form, Card } from "react-bootstrap";
import { Container, Row, Col, Tab, Tabs } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import Select, { StylesConfig } from 'react-select';
import React, { useState, useEffect } from "react";
import { apiFetchCtr, apiUpdateCtr } from "../../../../libs/dbUtils";
import { useRouter } from "next/router";
import AlertDialog from "src/components/utils/AlertDialog";
import { ITokenVerfy, IinvoiceDetails } from "@models/common-model";
import {
  hasPermissions,
  keyValueRules,
  verifayTokens,
} from "src/pages/api/checkUtils";
import * as cookie from "cookie";
import ShowPriceListModal from "src/components/dashboard/modal/ShowPriceListModal";
import { Toastify } from "src/libs/allToasts";
import { ToastContainer } from "react-toastify";
import { defaultInvoiceDetials } from "@models/data";
import storage from "firebaseConfig";
import {
  ref,
  deleteObject,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { generateUniqueString } from "src/libs/toolsUtils";

const Appearance: NextPage = (probs: any) => {
  const { shopId } = probs;
  const router = useRouter();
  const [key, setKey] = useState("Recipt");
  const [formObj, setFormObj] = useState<IinvoiceDetails>(
    defaultInvoiceDetials
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);
  const [img, setImg] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [invoiceType, setInvoiceType] = useState("receipt")
  const invoiceOptions: any = [{value: "receipt", label: "Receipt"}, {value: "a4", label: "Invoice A4"}]
  useEffect(() => {
    const inv: string = localStorage.getItem("invoiceType")
    if(inv) setInvoiceType(JSON.parse(inv))
    else {
      localStorage.setItem("invoiceType", JSON.stringify({value: "receipt", label: "Receipt"}))
    }
  }, [])

  async function initDataPage() {
    const { success, data } = await apiFetchCtr({
      fetch: "pos",
      subType: "getAppearance",
      shopId,
    });
    if (!success) {
      Toastify("error", "Somthing wrong!!, try agian");
      return;
    }
    if (
      data.details != undefined &&
      data.details != null &&
      data.details.length > 10
    ) {
      const _data = JSON.parse(data.details);
      setFormObj({ ...formObj, ..._data });
    }
    setIsLoading(false);
  }
  async function editInvice(url = "0") {
    if (isLoading) return;
    setIsLoading(true);
    const { success } = await apiUpdateCtr({
      type: "pos",
      subType: "EditAppearance",
      shopId,
      data: { formObj, url },
    });
    if (!success) {
      Toastify("error", "Somthing wrong!!, try agian");
      return;
    }
    setIsLoading(false);
    setPreviewUrl("");
    Toastify("success", "successfully updated");
  }
  const imageChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setImg(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };
  useEffect(() => {
    initDataPage();
  }, [router.asPath]);

  const handleRemoveImg = () => {
    if (img) {
      const desertRef = ref(storage, formObj.logo);
      deleteObject(desertRef)
        .then(() => {
          handleUpload();
        })
        .catch((error: any) => {
          handleUpload();
        });
    } else handleUpload();
  };

  const handleSave = () => {
    if (previewUrl.length > 2) handleRemoveImg();
    else editInvice();
  };
  async function handleUpload() {
    if (previewUrl.length < 2) {
      console.log("select first");
      Toastify("error", "Error ,Please Select Logo First");
    } else {
      const storageRef = ref(
        storage,
        `/files/logo/${generateUniqueString(12)}${shopId}`
      );
      const uploadTask = uploadBytesResumable(storageRef, img);
      uploadTask.on(
        "state_changed",
        (snapshot: any) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log(percent);
          // setPercent(percent);
        },
        (err) => {
          console.log(err);
          Toastify("error", "error occurred while uploading the logo...");
        },
        async () => {
          await getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            console.log(url);
            setFormObj({ ...formObj, logo: url });
            editInvice(url);
          });
        }
      );
    }
  }
  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        {!isLoading ? (
          <>
            <Select
              className="mt-3"
              options={invoiceOptions}
              value={invoiceType}
              onChange={(e: any) => {
                localStorage.setItem("invoiceType", JSON.stringify(e))
                setInvoiceType(e)                
              }}
            />
            <Tabs
              id="controlled-tab-example"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-3"
            >
              <Tab eventKey="Recipt" title="Receipt">
                <div className="row">
                  <div className="col-md-12">
                    <Card>
                      <Card.Header className="p-3 bg-white">
                        <h5>Print Receipt</h5>
                        <div className="appear-toolbar">
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          "loading..."
                        ) : (
                          <div className="appear-body">
                            <div className="appear-body-item">
                              {previewUrl.length == 0 ? (
                                <div>
                                  <label>
                                    Your Logo:{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    id="product-image"
                                    name="product-image"
                                    onChange={imageChange}
                                  />
                                </div>
                              ) : (
                                <div className="invoice-accept-btns">
                                  <button
                                    type="button"
                                    className="btn btn-danger p-2"
                                    onClick={() => setPreviewUrl("")}
                                    style={{ width: "100%", maxWidth: "100%" }}
                                  >
                                    <FontAwesomeIcon icon={faCancel} /> Cancel
                                  </button>
                                </div>
                              )}
                              <div className="form-group2">
                                <label>
                                  Business Name:{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.name}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      name: e.target.value,
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  Phone: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.tell}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      tell: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Customer:{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtCustomer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtCustomer: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Order No:{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.orderNo}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      orderNo: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Order Date:{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtDate}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtDate: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Qty: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtQty}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtQty: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Item: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtItem}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtItem: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Amount: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtAmount}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtAmount: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Tax: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtTax}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtTax: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Total: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtTotal}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtTotal: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Footer: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.footer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      footer: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="invoice-settings-body">
                                <div className="invoice-settings-item">
                                  <div>Enable Multi Language</div>
                                  <div>
                                    <Form.Check
                                      type="switch"
                                      className="custom-switch"
                                      checked={formObj.isMultiLang}
                                      onChange={(e) => {
                                        console.log(e);
                                        setFormObj({
                                          ...formObj,
                                          isMultiLang: !formObj.isMultiLang,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              {formObj.isMultiLang && (
                                <>
                                  <div className="form-group2">
                                    <label>
                                      Customer:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtCustomer2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtCustomer2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Order No:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj.orderNo2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          orderNo2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Order Date:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj.txtDate2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtDate2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Qty:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtQty2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtQty2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Item:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtItem2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtItem2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Amount:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtAmount2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtAmount2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Tax:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtTax2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtTax2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Total:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtTotal2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtTotal2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Footer:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.footer2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          footer2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                </>
                              )}
                              <button
                                type="button"
                                className="btn btn-primary p-2"
                                onClick={() => handleSave()}
                                style={{
                                  width: "100%",
                                  maxWidth: "100%",
                                  marginTop: "10px",
                                }}
                              >
                                Save
                              </button>
                            </div>
                            <div className="appear-body-item">
                              <div className="preview-invoice-box">
                                {previewUrl.length > 0 ? (
                                  <img src={previewUrl} />
                                ) : (
                                  <img src={formObj.logo} />
                                )}
                                <div className="top-content">
                                  <h6 className="text-primary">
                                    {formObj.name}
                                  </h6>
                                  <h6 className="text-primary">
                                    {formObj.tell}
                                  </h6>
                                </div>
                                <div className="order-details-top">
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.txtCustomer}{" "}
                                      {formObj.isMultiLang &&
                                        formObj.txtCustomer2}
                                    </div>
                                    <div>Walk-in-customer</div>
                                  </div>
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.orderNo}{" "}
                                      {formObj.isMultiLang && formObj.orderNo2}
                                    </div>
                                    <div>1518</div>
                                  </div>
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.txtDate}{" "}
                                      {formObj.isMultiLang && formObj.txtDate2}
                                    </div>
                                    <div>2023-03-31</div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{ marginTop: "5px" }}
                                >
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.txtQty}{" "}
                                      {formObj.isMultiLang && formObj.txtQty2}
                                    </div>
                                    <div>
                                      {formObj.txtItem}{" "}
                                      {formObj.isMultiLang && formObj.txtItem2}
                                    </div>
                                    <div>
                                      {formObj.txtAmount}{" "}
                                      {formObj.isMultiLang &&
                                        formObj.txtAmount2}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: "5px",
                                    borderBottom: "1px solid #eaeaea",
                                  }}
                                >
                                  <div className="order-details-top-item">
                                    <div>1</div>
                                    <div>Product Name 1</div>
                                    <div>5.000</div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: "5px",
                                    borderBottom: "1px solid #eaeaea",
                                  }}
                                >
                                  <div className="order-details-top-item">
                                    <div>1</div>
                                    <div>Product Name 2</div>
                                    <div>4.000</div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: "5px",
                                    borderBottom: "1px solid #696969",
                                  }}
                                >
                                  <div className="order-details-top-item">
                                    <div></div>
                                    <div>
                                      {formObj.txtTax}{" "}
                                      {formObj.isMultiLang && formObj.txtTax2}
                                    </div>
                                    <div>0.540</div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: "5px",
                                    borderBottom: "1px solid #696969",
                                  }}
                                >
                                  <div className="order-details-top-item">
                                    <div></div>
                                    <div>
                                      {formObj.txtTotal}{" "}
                                      {formObj.isMultiLang && formObj.txtTotal2}
                                    </div>
                                    <div>9.540</div>
                                  </div>
                                </div>
                                <div
                                  className="top-content"
                                  style={{
                                    marginTop: "20px",
                                    marginBottom: "20px",
                                  }}
                                >
                                  <h6 className="text-primary">
                                    {formObj.footer}
                                    <br />
                                    {formObj.isMultiLang && formObj.footer2}
                                  </h6>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab>
              <Tab eventKey="Invoice" title="Invoice A4">
                <div className="row">
                  <div className="col-md-12">
                    <Card>
                      <Card.Header className="p-3 bg-white">
                        <h5>Print Invoice</h5>
                        <div className="appear-toolbar">
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          "loading..."
                        ) : (
                          <div className="appear-body">
                            <div className="appear-body-item">
                              {previewUrl.length == 0 ? (
                                <div>
                                  <label>
                                    Your Logo:{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    id="product-image"
                                    name="product-image"
                                    onChange={imageChange}
                                  />
                                </div>
                              ) : (
                                <div className="invoice-accept-btns">
                                  <button
                                    type="button"
                                    className="btn btn-danger p-2"
                                    onClick={() => setPreviewUrl("")}
                                    style={{ width: "100%", maxWidth: "100%" }}
                                  >
                                    <FontAwesomeIcon icon={faCancel} /> Cancel
                                  </button>
                                </div>
                              )}
                              <div className="form-group2">
                                <label>
                                  Business Name:{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.name}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      name: e.target.value,
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  Phone: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.tell}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      tell: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Customer:{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtCustomer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtCustomer: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Order No:{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.orderNo}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      orderNo: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Order Date:{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtDate}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtDate: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Qty: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtQty}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtQty: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Item: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtItem}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtItem: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Amount: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtAmount}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtAmount: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Tax: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtTax}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtTax: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Total: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtTotal}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtTotal: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Footer: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.footer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      footer: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="invoice-settings-body">
                                <div className="invoice-settings-item">
                                  <div>Enable Multi Language</div>
                                  <div>
                                    <Form.Check
                                      type="switch"
                                      className="custom-switch"
                                      checked={formObj.isMultiLang}
                                      onChange={(e) => {
                                        console.log(e);
                                        setFormObj({
                                          ...formObj,
                                          isMultiLang: !formObj.isMultiLang,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              {formObj.isMultiLang && (
                                <>
                                  <div className="form-group2">
                                    <label>
                                      Customer:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtCustomer2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtCustomer2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Order No:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj.orderNo2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          orderNo2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Order Date:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj.txtDate2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtDate2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Qty:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtQty2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtQty2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Item:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtItem2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtItem2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Amount:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtAmount2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtAmount2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Tax:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtTax2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtTax2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Total:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtTotal2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtTotal2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Footer:{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.footer2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          footer2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                </>
                              )}
                              <button
                                type="button"
                                className="btn btn-primary p-2"
                                onClick={() => handleSave()}
                                style={{
                                  width: "100%",
                                  maxWidth: "100%",
                                  marginTop: "10px",
                                }}
                              >
                                Save
                              </button>
                            </div>
                            <div className="appear-body-item a4">
                              <div className="bill2">
                                <div className="brand-logo">
                                  <img src={formObj.logo} />
                                  <div className="invoice-print">
                                    INVOICE
                                    <div>
                                      <table className="GeneratedTable">
                                        <tbody>
                                          <tr>
                                            <td className="td_bg">
                                              INVOICE NUMBER{" "}
                                            </td>
                                            <td>{formObj.orderNo}</td>
                                          </tr>
                                          <tr>
                                            <td className="td_bg">
                                              INVOICE DATE{" "}
                                            </td>
                                            <td>
                                              {new Date()
                                                .toISOString()
                                                .slice(0, 10)}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                                <br />
                                <div className="up_of_table flex justify-between">
                                  <div className="left_up_of_table">
                                    <div>Billed From</div>
                                    <div>{formObj.name}</div>
                                    <div>info@poslix.com</div>
                                    <div>{formObj.tell}</div>
                                    <div>
                                      Office 21-22, Building 532, Mazoon St.
                                      Muscat, Oman
                                    </div>
                                    <div>VAT Number: OM1100270001</div>
                                  </div>
                                  <div className="right_up_of_table">
                                    <div>Billed To</div>
                                    <div>{formObj.txtCustomer}</div>
                                    {/* <span>Billed To</span> */}
                                  </div>
                                </div>
                                <br />

                                <table className="GeneratedTable2">
                                  <thead>
                                    <tr>
                                      <th>Description</th>
                                      <th>
                                        {" "}
                                        {formObj.txtQty}
                                        <br />
                                        {formObj.isMultiLang && formObj.txtQty2}
                                      </th>
                                      <th>Unit Price</th>
                                      {/* <th> {invoicDetails.txtItem}<br />{invoicDetails.isMultiLang && invoicDetails.txtItem2}</th> */}
                                      <th>Tax</th>
                                      <th>
                                        {" "}
                                        {formObj.txtAmount}
                                        <br />
                                        {formObj.isMultiLang &&
                                          formObj.txtAmount2}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      {/* <td>{invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}</td> */}
                                      <td
                                        colSpan={4}
                                        className="txt_bold_invoice"
                                      >
                                        Sub Total
                                      </td>
                                      <td></td>
                                    </tr>
                                    <tr>
                                      <td
                                        colSpan={4}
                                        className="txt_bold_invoice"
                                      >
                                        Total
                                      </td>
                                      <td className="txt_bold_invoice">
                                        {formObj.txtTotal}{" "}
                                        {formObj.isMultiLang &&
                                          formObj.txtTotal2}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                <p className="recipt-footer">
                                  {formObj.footer}

                                  {formObj.isMultiLang && formObj.footer2}
                                </p>
                                {/* <p className="recipt-footer">{formObj.notes}</p> */}
                                <br />
                              </div>

                              {/* <div className="preview-invoice-box">
                                            {previewUrl.length > 0 ? <img src={previewUrl} /> : <img src={formObj.logo} />}
                                            <div className='top-content'>
                                                <h6 className='text-primary'>{formObj.name}</h6>
                                                <h6 className='text-primary'>{formObj.tell}</h6>
                                            </div>
                                            <div className='order-details-top'>
                                                <div className="order-details-top-item">
                                                    <div>{formObj.txtCustomer} {formObj.isMultiLang && formObj.txtCustomer2}</div>
                                                    <div>Walk-in-customer</div>
                                                </div>
                                                <div className="order-details-top-item">
                                                    <div>{formObj.orderNo} {formObj.isMultiLang && formObj.orderNo2}</div>
                                                    <div>1518</div>
                                                </div>
                                                <div className="order-details-top-item">
                                                    <div>{formObj.txtDate} {formObj.isMultiLang && formObj.txtDate2}</div>
                                                    <div>2023-03-31</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px' }}>
                                                <div className="order-details-top-item">
                                                    <div>{formObj.txtQty} {formObj.isMultiLang && formObj.txtQty2}</div><div>{formObj.txtItem} {formObj.isMultiLang && formObj.txtItem2}</div><div>{formObj.txtAmount} {formObj.isMultiLang && formObj.txtAmount2}</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px', borderBottom: '1px solid #eaeaea' }}>
                                                <div className="order-details-top-item">
                                                    <div>1</div><div>Product Name 1</div><div>5.000</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px', borderBottom: '1px solid #eaeaea' }}>
                                                <div className="order-details-top-item">
                                                    <div>1</div><div>Product Name 2</div><div>4.000</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px', borderBottom: '1px solid #696969' }}>
                                                <div className="order-details-top-item">
                                                    <div></div><div>{formObj.txtTax} {formObj.isMultiLang && formObj.txtTax2}</div><div>0.540</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px', borderBottom: '1px solid #696969' }}>
                                                <div className="order-details-top-item">
                                                    <div></div><div>{formObj.txtTotal} {formObj.isMultiLang && formObj.txtTotal2}</div><div>9.540</div>
                                                </div>
                                            </div>
                                            <div className='top-content' style={{ marginTop: '20px', marginBottom: '20px' }}>
                                                <h6 className='text-primary'>{formObj.footer}<br />{formObj.isMultiLang && formObj.footer2}</h6>
                                            </div>
                                        </div> */}
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
      </AdminLayout>
    </>
  );
};
export default Appearance;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || "[]");
  var _isOk = true,
    _rule = true;
  //check page params
  var shopId = context.query.id;
  if (shopId == undefined)
    return { redirect: { permanent: false, destination: "/page403" } };

  //check user permissions
  var _userRules = {};
  await verifayTokens(
    { headers: { authorization: "Bearer " + parsedCookies.tokend } },
    (repo: ITokenVerfy) => {
      _isOk = repo.status;

      if (_isOk) {
        var _rules = keyValueRules(repo.data.rules || []);
        console.log(_rules);
        if (
          _rules[-2] != undefined &&
          _rules[-2][0].stuff != undefined &&
          _rules[-2][0].stuff == "owner"
        ) {
          _rule = true;
          _userRules = {
            hasDelete: true,
            hasEdit: true,
            hasView: true,
            hasInsert: true,
          };
        } else if (_rules[shopId] != undefined) {
          var _stuf = "";
          _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
          const { userRules, hasPermission } = hasPermissions(
            _stuf,
            "appearance"
          );
          _rule = hasPermission;
          _userRules = userRules;
        } else _rule = false;
      }
    }
  );
  console.log("_isOk22    ", _isOk);
  if (!_isOk)
    return { redirect: { permanent: false, destination: "/user/login" } };
  if (!_rule)
    return { redirect: { permanent: false, destination: "/page403" } };
  return {
    props: { shopId: context.query.id, rules: _userRules },
  };
  //status ok
}
