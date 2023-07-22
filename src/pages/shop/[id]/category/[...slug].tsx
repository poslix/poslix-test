import type { NextPage } from "next";
import Select from "react-select";
import { useRouter } from "next/router";
import Spinner from "react-bootstrap/Spinner";
import { AdminLayout } from "@layout";
import { Card } from "react-bootstrap";
import React, { useState, useEffect, useRef } from "react";
import {
  apiFetchCtr,
  apiInsertCtr,
  apiUpdateCtr,
} from "../../../../libs/dbUtils";
import * as cookie from "cookie";
import {
  getRealWord,
  hasPermissions,
  keyValueRules,
  verifayTokens,
} from "src/pages/api/checkUtils";
import { ITokenVerfy } from "@models/common-model";
import Link from "next/dist/client/link";
import { ToastContainer } from "react-toastify";
import { Toastify } from "src/libs/allToasts";

const Product: NextPage = (probs: any) => {
  const { shopId, pageType, editId } = probs;
  const [formObj, setFormObj] = useState({
    id: 0,
    name: "",
    des: "",
    tax: null,
  });
  const [errorForm, setErrorForm] = useState({ name: false });
  const colourStyles = {
    control: (style: any) => ({ ...style, borderRadius: "10px" }),
  };
  const [taxGroup, setTaxGroup] = useState<{ value: number; label: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  const router = useRouter();
  var formObjRef = useRef<any>();
  formObjRef.current = formObj;

  async function initDataPage(id = "0", type = "") {
    if (id != "0") setIsEdit(true);
    var result = await apiFetchCtr({
      fetch: "categery_brand",
      subType: "initCateBrand",
      shopId,
      id,
      type,
    });
    const { success, newdata } = result;

    if (!success) {
      Toastify("error", "Error in init page");
      return;
    }
    setTaxGroup([
      { value: null, label: "Default Tax" },
      { value: -1, label: "Never Tax" },
      ...newdata.taxes,
    ]);
    console.log(newdata);

    if (newdata.itm.length > 0) {
      const itm = newdata.itm[0];
      itm.tax_id = itm.tax_id == 0 ? null : itm.tax_id;
      setFormObj({
        ...formObj,
        id: itm.id,
        name: itm.name,
        des: itm.description,
        tax: itm.never_tax == 1 ? -1 : itm.tax_id,
      });
    }
    setLoading(false);
  }

  async function insertHandle() {
    var result = await apiInsertCtr({
      type: "categery_brand",
      subType: "insert_" + pageType,
      shopId,
      data: { frmobj: formObjRef.current },
    });
    const { success } = result;
    if (success) {
      Toastify("success", "successfuly added");
      setTimeout(() => {
        router.push("/shop/" + shopId + "/category");
      }, 1000);
    } else {
      alert("Has Error ,try Again");
    }
  }
  async function editHandle() {
    var result = await apiUpdateCtr({
      type: "categery_brand",
      subType: "edit_" + pageType,
      shopId,
      data: { frmobj: formObjRef.current },
    });
    const { success } = result;
    if (success) {
      Toastify("success", "successfuly added");
      setTimeout(() => {
        router.push("/shop/" + shopId + "/category");
      }, 1000);
    } else {
      alert("Has Error ,try Again");
    }
  }
  var errors = [];
  const [show, setShow] = useState(false);

  useEffect(() => {
    initDataPage(editId, pageType);
  }, [router.asPath]);

  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <div className="row">
          <div className="mb-4">
            <Link
              className="btn btn-primary p-3"
              href={"/shop/" + shopId + "/category"}
              onClick={(e)=>{
                e.preventDefault();
                pageType === "category"
                  ? localStorage.setItem("key", "Categories")
                  : localStorage.setItem("key", "Brands");
                  router.push("/shop/" + shopId + "/category");
              }}
            >
              Back To List
            </Link>
          </div>
        </div>
        <Card className="mb-4">
          <Card.Header className="p-3 bg-white">
            <h5>{isEdit ? "Edit " + pageType : "Add New " + pageType}</h5>
          </Card.Header>
          <Card.Body>
            {!loading ? (
              <form className="form-style">
                <div className="form-group2">
                  <label>
                    Name: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=" Enter Name"
                    value={formObj.name}
                    onChange={(e) => {
                      setFormObj({ ...formObj, name: e.target.value });
                    }}
                  />
                  {errorForm.name && (
                    <p className="p-1 h6 text-danger ">Enter {pageType} name</p>
                  )}
                </div>
                <div className="row">
                  <div className="form-group">
                    <label>description:</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="description"
                      value={formObj.des}
                      onChange={(e) => {
                        setFormObj({ ...formObj, des: e.target.value });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Custom Tax :</label>
                    <Select
                      styles={colourStyles}
                      options={taxGroup}
                      value={taxGroup.filter((f: any) => {
                        return f.value == formObj.tax;
                      })}
                      onChange={(itm) => {
                        setFormObj({ ...formObj, tax: itm!.value });
                      }}
                    />
                  </div>
                </div>
                <br />
                <button
                  type="button"
                  className="btn m-btn btn-primary p-2 "
                  onClick={(e) => {
                    pageType === "category"
                      ? localStorage.setItem("key", "Categories")
                      : localStorage.setItem("key", "Brands");
                    e.preventDefault();
                    errors = [];

                    if (formObj.name.length == 0) errors.push("error");

                    setErrorForm({
                      ...errorForm,
                      name: formObj.name.length == 0 ? true : false,
                    });
                    if (errors.length == 0) {
                      isEdit ? editHandle() : insertHandle();
                    } else alert("Enter Requires Field");
                  }}
                >
                  {isEdit ? "Edit" : "Save"}
                </button>
              </form>
            ) : (
              <div className="d-flex justify-content-around">
                <Spinner animation="grow" />
              </div>
            )}
          </Card.Body>
        </Card>
      </AdminLayout>
    </>
  );
};
export default Product;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || "[]");
  //check page params
  var shopId = context.query.id;
  var _addOrEdit = context.query.slug[0];
  var _EditId = context.query.slug[1];
  var _pageType = context.query.type;
  var _isOk = true,
    _hasPer = true;
  if (shopId == undefined) _isOk = false;
  if (_addOrEdit == undefined || (_addOrEdit != "add" && _addOrEdit != "edit"))
    _isOk = false;
  if (
    _pageType == undefined ||
    (_pageType != "category" && _pageType != "brand")
  )
    _isOk = false;
  if (!_isOk || context.query.id == undefined) _isOk = false;
  if (!_isOk)
    return { redirect: { permanent: false, destination: "/page403" } };

  //check user permission
  var _userRules;
  await verifayTokens(
    { headers: { authorization: "Bearer " + parsedCookies.tokend } },
    (repo: ITokenVerfy) => {
      _isOk = repo.status;
      if (_isOk) {
        var _rules = keyValueRules(repo.data.rules || []);
        if (
          _rules[-2] != undefined &&
          _rules[-2][0].stuff != undefined &&
          _rules[-2][0].stuff == "owner"
        ) {
          _hasPer = true;
        } else if (_rules[shopId] != undefined) {
          var _stuf = "";
          _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
          _addOrEdit = getRealWord(_addOrEdit);
          const { hasPermission } = hasPermissions(
            _stuf,
            "category",
            _addOrEdit
          );
          _hasPer = hasPermission;
        } else _isOk = false;
      }
    }
  );
  if (!_isOk)
    return { redirect: { permanent: false, destination: "/user/login" } };
  if (!_hasPer)
    return { redirect: { permanent: false, destination: "/page403" } };
  //status ok
  return {
    props: {
      shopId,
      pageType: _pageType,
      editId: _addOrEdit == "edit" ? _EditId : 0,
    },
  };
}
