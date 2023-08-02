import type { NextPage } from 'next';
import Image from 'next/image';
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import { faTrash, faPenToSquare, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card, Tab, Tabs } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { apiFetch, apiFetchCtr } from '../../../../libs/dbUtils';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import { redirectToLogin } from '../../../../libs/loginlib';
import { ILocationSettings, IPageRules, ITokenVerfy } from '@models/common-model';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie';
import ShowPriceListModal from 'src/components/dashboard/modal/ShowPriceListModal';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import Link from 'next/link';

const Product: NextPage = (probs: any) => {
  const { shopId, rules } = probs;
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const router = useRouter();
  const [tailoring, setTailoring] = useState<{ id: number; name: string; multiple: number }[]>([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);

  async function initDataPage() {
    const { success, data } = await apiFetchCtr({ fetch: 'tailoring', subType: 'getList', shopId });
    if (!success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    setTailoring(data.tailoring);
    setExtras(data.extras);
    setIsLoading(false);
  }

  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    else alert('errorr location settings');
    initDataPage();
  }, [router.asPath]);
  const [key, setKey] = useState('types');
  const handleDelete = (result: boolean, msg: string) => {
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
    if (result) {
      const _rows = [...tailoring];
      const idx = _rows.findIndex((itm: any) => itm.id == selectId);
      _rows.splice(idx, 1);
      setTailoring(_rows);
    }
  };
  const showItems = (items: string) => {
    const _data = JSON.parse(items);
    return _data.map((dt: any, i: number) => {
      return <p key={i}>{dt.name}</p>;
    });
  };
  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          alertFun={handleDelete}
          shopId={shopId}
          id={selectId}
          subType="delTailoring"
          type="tailoring"
          products={tailoring}>
          Are you Sure You Want Delete This Item ?
        </AlertDialog>
        <ShowPriceListModal
          shopId={shopId}
          productId={selectId}
          type={type}
          isOpenPriceDialog={isOpenPriceDialog}
          setIsOpenPriceDialog={() => setIsOpenPriceDialog(false)}
        />
        <div className="row">
          <div className="col-md-12">
            <Tabs
              id="controlled-tab-example"
              activeKey={key}
              onSelect={(k: any) => setKey(k)}
              className="mb-3 p-3">
              <Tab eventKey="types" title="Types">
                {rules.hasInsert && (
                  <div className="mb-4">
                    <Link
                      className="btn btn-primary p-3"
                      href={'/shop/' + shopId + '/tailoring/add'}>
                      <FontAwesomeIcon icon={faPlus} /> Add New Tailoring Type{' '}
                    </Link>
                  </div>
                )}
                <Card>
                  <Card.Header className="p-3 bg-white">
                    <h5>Tailoring List</h5>
                  </Card.Header>
                  <Card.Body className="table-responsive text-nowrap">
                    {!isLoading ? (
                      <Table className="table table-hover" responsive>
                        <thead className="thead-dark">
                          <tr>
                            <th style={{ width: '4%' }}>#</th>
                            <th>Name</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tailoring.length > 0 ? (
                            tailoring.map((pro: any, index: number) => {
                              return (
                                <tr key={index}>
                                  <th scope="row">{pro.id}</th>
                                  <td>
                                    {pro.type_name} / {pro.multiple_value}{' '}
                                    <span className="under-text">[{pro.name}]</span>
                                  </td>
                                  <td>
                                    <ButtonGroup className="mb-2 m-buttons-style">
                                      {rules.hasEdit && (
                                        <Button
                                          onClick={() => {
                                            router.push(
                                              '/shop/' + shopId + '/tailoring/edit/' + pro.id
                                            );
                                          }}>
                                          <FontAwesomeIcon icon={faPenToSquare} />
                                        </Button>
                                      )}
                                      {rules.hasDelete && (
                                        <Button
                                          onClick={() => {
                                            setSelectId(pro.id);
                                            setShow(true);
                                          }}>
                                          <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                      )}
                                    </ButtonGroup>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <th colSpan={9} className="no-products">
                                No tailoring items
                              </th>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="d-flex justify-content-around">
                        <Spinner animation="grow" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab>
              <Tab eventKey="extras" title="Extras">
                {rules.hasInsert && (
                  <div className="mb-4">
                    <Link
                      className="btn btn-primary p-3"
                      href={'/shop/' + shopId + '/tailoring/extra/add'}>
                      <FontAwesomeIcon icon={faPlus} /> Add New Extra{' '}
                    </Link>
                  </div>
                )}
                <Card>
                  <Card.Header className="p-3 bg-white">
                    <h5>Extras List</h5>
                  </Card.Header>
                  <Card.Body className="table-responsive text-nowrap">
                    {!isLoading ? (
                      <Table className="table table-hover" responsive>
                        <thead className="thead-dark">
                          <tr>
                            <th style={{ width: '4%' }}>#</th>
                            <th>Title</th>
                            <th>Items</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extras.length > 0 ? (
                            extras.map((pro: any, index: number) => {
                              return (
                                <tr key={index}>
                                  <th scope="row">{pro.id}</th>
                                  <td>{pro.name}</td>
                                  <td>{showItems(pro.items)}</td>
                                  <td>
                                    <ButtonGroup className="mb-2 m-buttons-style">
                                      {rules.hasEdit && (
                                        <Button
                                          onClick={() => {
                                            router.push(
                                              '/shop/' + shopId + '/tailoring/extra/edit/' + pro.id
                                            );
                                          }}>
                                          <FontAwesomeIcon icon={faPenToSquare} />
                                        </Button>
                                      )}
                                      {rules.hasDelete && (
                                        <Button
                                          onClick={() => {
                                            setSelectId(pro.id);
                                            setShow(true);
                                          }}>
                                          <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                      )}
                                    </ButtonGroup>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <th colSpan={9} className="no-products">
                                No tailoring items
                              </th>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="d-flex justify-content-around">
                        <Spinner animation="grow" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};
export default Product;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true,
    _rule = true;
  //check page params
  var shopId = context.query.id;
  if (shopId == undefined) return { redirect: { permanent: false, destination: '/page403' } };

  //check user permissions
  var _userRules = {};
  await verifayTokens(
    { headers: { authorization: 'Bearer ' + parsedCookies.tokend } },
    (repo: ITokenVerfy) => {
      _isOk = repo.status;

      if (_isOk) {
        var _rules = keyValueRules(repo.data.rules || []);
        console.log(_rules);
        if (
          _rules[-2] != undefined &&
          _rules[-2][0].stuff != undefined &&
          _rules[-2][0].stuff == 'owner'
        ) {
          _rule = true;
          _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
        } else if (_rules[shopId] != undefined) {
          var _stuf = '';
          _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
          const { userRules, hasPermission } = hasPermissions(_stuf, 'tailoring');
          _rule = hasPermission;
          _userRules = userRules;
        } else _rule = false;
      }
    }
  );
  console.log('_isOk22    ', _isOk);
  if (!_isOk) return { redirect: { permanent: false, destination: '/user/auth' } };
  if (!_rule) return { redirect: { permanent: false, destination: '/page403' } };
  return {
    props: { shopId: context.query.id, rules: _userRules },
  };
  //status ok
}
