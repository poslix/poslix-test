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
import withAuth from 'src/HOCs/withAuth';
import { findAllData } from 'src/services/crud.api';

const Category = ({ rules }: any) => {
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [shopId, setShopId] = useState('');
  const [type, setType] = useState('');
  const [selectId, setSelectId] = useState(0);
  const [key, setKey] = useState('categories');
  const [isloading, setIsloading] = useState(true);

  async function initDataPage() {
    if(router.isReady) {
      setShopId(router.query.id.toString())
      const resCategories = await findAllData(`categories/${router.query.id}`)
      const resBrands = await findAllData(`brands/${router.query.id}`)
      if (resCategories.data.success) {
        setCats(resCategories.data.result);
      }
      if (resBrands.data.success) {
        setBrands(resBrands.data.result);
      }
      setIsloading(false);
    }
  }
  useEffect(() => {
    initDataPage();
  }, [router.asPath]);

  const [categoryPermissions, setCategoryPermissions] = useState<any>()
  const [brandPermissions, setBrandPermissions] = useState<any>()
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions'));
    const getCategoryPermissions = {hasView: false, hasInsert: false, hasEdit: false, hasDelete: false}
    const getBrandPermissions = {hasView: false, hasInsert: false, hasEdit: false, hasDelete: false}
    perms.category.map((perm) =>
      perm.name.includes('GET') ? getCategoryPermissions.hasView = true
      : perm.name.includes('POST') ? getCategoryPermissions.hasInsert = true
      : perm.name.includes('PUT') ? getCategoryPermissions.hasEdit = true
      : perm.name.includes('DELETE') ? getCategoryPermissions.hasDelete = true : null)
    perms.category.map((perm) =>
      perm.name.includes('GET') ? getBrandPermissions.hasView = true
      : perm.name.includes('POST') ? getBrandPermissions.hasInsert = true
      : perm.name.includes('PUT') ? getBrandPermissions.hasEdit = true
      : perm.name.includes('DELETE') ? getBrandPermissions.hasDelete = true : null)

    setCategoryPermissions(getCategoryPermissions)
    setBrandPermissions(getBrandPermissions)
  }, [])
  return (
    <>
      <AdminLayout shopId={shopId}>
        <AlertDialog
          alertShow={show}
          alertFun={(e: boolean) => {
            setShow(false)
            Toastify('success', 'successfuly Done!');
            initDataPage()
          }}
          id={selectId}
          expenses={cats}
          url={type}>
          Are you Sure You Want Delete This Item ?
        </AlertDialog>
        <div className="row">
          {!isloading && (categoryPermissions.hasInsert || brandPermissions.hasInsert) && (
            <div className="mb-4">
              <button
                className="btn btn-primary p-3"
                onClick={() => {
                  if (key === 'categories' && categoryPermissions.hasInsert)
                    router.push({
                      pathname: '/shop/' + shopId + '/category/add',
                      query: { type: 'categories' },
                    });
                  else if (key === 'brands' && brandPermissions.hasInsert)
                    router.push({
                      pathname: '/shop/' + shopId + '/category/add',
                      query: { type: 'brands' },
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
            <Tab eventKey="categories" title="Categories">
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
                                  {categoryPermissions.hasEdit && (
                                    <Button
                                      onClick={() =>
                                        router.push({
                                          pathname: '/shop/' + shopId + '/category/edit/' + ex.id,
                                          query: { type: 'categories' }
                                        })
                                      }>
                                      <FontAwesomeIcon icon={faPenToSquare} />
                                    </Button>
                                  )}
                                  {categoryPermissions.hasDelete && (
                                    <Button
                                      onClick={() => {
                                        setSelectId(ex.id);
                                        setShow(true);
                                        setType('categories');
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

            <Tab eventKey="brands" title="Brands">
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
                                  {brandPermissions.hasEdit && (
                                    <Button
                                      onClick={() =>
                                        router.push({
                                          pathname: '/shop/' + shopId + '/category/edit/' + ex.id,
                                          query: { type: 'brands' }
                                        })
                                      }>
                                      <FontAwesomeIcon icon={faPenToSquare} />
                                    </Button>
                                  )}
                                  {brandPermissions.hasDelete && (
                                    <Button
                                      onClick={() => {
                                        setSelectId(ex.id);
                                        setShow(true);
                                        setType('brands');
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
export default withAuth(Category);