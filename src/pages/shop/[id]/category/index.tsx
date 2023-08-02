import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import { faTrash, faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { apiFetchCtr } from '../../../../libs/dbUtils';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import * as cookie from 'cookie';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { ITokenVerfy } from '@models/common-model';
import { Toastify } from 'src/libs/allToasts';

const Category = ({ shopId, rules }: any) => {
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [key, setKey] = useState('Categories');
  const [isloading, setIsloading] = useState(true);

  async function initDataPage() {
    const { success, newdata } = await apiFetchCtr({
      fetch: 'categery_brand',
      subType: 'getCatsAndBrands',
      shopId,
    });
    console.log(newdata);

    if (success) {
      setCats(newdata.cates);
      setBrands(newdata.brands);
      setIsloading(false);
    }
  }
  useEffect(() => {
    const key = localStorage.getItem('key');
    if (key) {
      setKey(key);
    }
    initDataPage();
    return () => localStorage.removeItem('key');
  }, [router.asPath]);

  return (
    <>
      <AdminLayout shopId={shopId}>
        <AlertDialog
          alertShow={show}
          alertFun={(e: boolean) => setShow(e)}
          id={selectId}
          expenses={cats}>
          Are you Sure You Want Delete This Item ?
        </AlertDialog>
        <div className="row">
          {rules.hasInsert && (
            <div className="mb-4">
              <button
                className="btn btn-primary p-3"
                onClick={() => {
                  console.log(key);
                  localStorage.setItem('key', key);
                  if (key === 'Categories')
                    router.push({
                      pathname: '/shop/' + shopId + '/category/add',
                      query: { type: 'category' },
                    });
                  else if (key === 'Brands')
                    router.push({
                      pathname: '/shop/' + shopId + '/category/add',
                      query: { type: 'brand' },
                    });
                  else Toastify('error', 'Error On Add New');
                }}>
                <FontAwesomeIcon icon={faPlus} /> Add New {key}{' '}
              </button>
            </div>
          )}
          <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k: any) => setKey(k)}
            className="mb-3 p-3">
            <Tab eventKey="Categories" title="Categories">
              <Card>
                <Card.Header className="p-3 bg-white">
                  <h5>Category List</h5>
                </Card.Header>
                <Card.Body className="table-responsive text-nowrap">
                  {!isloading ? (
                    <Table className="table table-hover" responsive>
                      <thead className="thead-dark">
                        <tr>
                          <th style={{ width: '6%' }}>#</th>
                          <th>Name</th>
                          <th>Tax</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cats.map((ex: any, i: number) => {
                          return (
                            <tr key={i} className="td-style-table">
                              <th scope="row">{ex.id}</th>
                              <td>{ex.name}</td>
                              <td>{ex.tax_name}</td>
                              <td>
                                <ButtonGroup className="mb-2 m-buttons-style">
                                  {rules.hasEdit && (
                                    <Button
                                      onClick={() =>
                                        router.push({
                                          pathname: '/shop/' + shopId + '/category/edit/' + ex.id,
                                          query: { type: 'category' },
                                        })
                                      }>
                                      <FontAwesomeIcon icon={faPenToSquare} />
                                    </Button>
                                  )}
                                  {rules.hasDelete && (
                                    <Button
                                      onClick={() => {
                                        setSelectId(ex.id);
                                        setShow(true);
                                      }}>
                                      <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                  )}
                                </ButtonGroup>
                              </td>
                            </tr>
                          );
                        })}
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

            <Tab eventKey="Brands" title="Brands">
              <Card>
                <Card.Header className="p-3 bg-white">
                  <h5>Brands List</h5>
                </Card.Header>
                <Card.Body className="table-responsive text-nowrap">
                  {!isloading ? (
                    <Table className="table table-hover" responsive>
                      <thead className="thead-dark">
                        <tr>
                          <th style={{ width: '6%' }}>#</th>
                          <th>Name</th>
                          <th>Tax</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brands.map((ex: any, i: number) => {
                          return (
                            <tr key={i} className="td-style-table">
                              <th scope="row">{ex.id}</th>
                              <td
                                style={{
                                  color: ex.tax_name != null || ex.never_tax == 1 ? '#eb8181' : '',
                                }}>
                                {ex.name}
                              </td>
                              <td>{ex.tax_name}</td>
                              <td>
                                <ButtonGroup className="mb-2 m-buttons-style">
                                  {rules.hasEdit && (
                                    <Button
                                      onClick={() =>
                                        router.push({
                                          pathname: '/shop/' + shopId + '/category/edit/' + ex.id,
                                          query: { type: 'brand' },
                                        })
                                      }>
                                      <FontAwesomeIcon icon={faPenToSquare} />
                                    </Button>
                                  )}
                                  {rules.hasDelete && (
                                    <Button
                                      onClick={() => {
                                        setSelectId(ex.id);
                                        setShow(true);
                                      }}>
                                      <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                  )}
                                </ButtonGroup>
                              </td>
                            </tr>
                          );
                        })}
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
      </AdminLayout>
    </>
  );
};
export default Category;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true,
    _hasPer = true;
  //check page params
  var shopId = context.query.id;
  if (shopId == undefined) return { redirect: { permanent: false, destination: '/page403' } };

  //check user permissions
  var _userRules;
  await verifayTokens(
    { headers: { authorization: 'Bearer ' + parsedCookies.tokend } },
    (repo: ITokenVerfy) => {
      _isOk = repo.status;
      if (_isOk) {
        var _rules = keyValueRules(repo.data.rules || []);
        if (
          _rules[-2] != undefined &&
          _rules[-2][0].stuff != undefined &&
          _rules[-2][0].stuff == 'owner'
        ) {
          _hasPer = true;
          _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
        } else if (_isOk && _rules[shopId] != undefined) {
          var _stuf = '';
          _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
          const { userRules, hasPermission } = hasPermissions(_stuf, 'category');
          _userRules = userRules;
          _hasPer = hasPermission;
        } else _hasPer = false;
      }
    }
  );
  if (!_isOk) return { redirect: { permanent: false, destination: '/user/auth' } };
  if (!_hasPer) return { redirect: { permanent: false, destination: '/page403' } };
  //status ok
  return {
    props: { shopId: context.query.id, rules: _userRules },
  };
}
