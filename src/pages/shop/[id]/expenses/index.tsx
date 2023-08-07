import type { NextPage } from 'next';
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import {
  faTrash,
  faFloppyDisk,
  faPenToSquare,
  faPaperclip,
  faPlus,
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import 'react-datepicker/dist/react-datepicker.css';
import AlertDialog from 'src/components/utils/AlertDialog';
import { apiFetchCtr, apiInsertCtr } from 'src/libs/dbUtils';
import * as cookie from 'cookie';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { IExpenseList, ITokenVerfy } from '@models/common-model';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { UserContext } from 'src/context/UserContext';
import AddNewExpeness from 'src/components/dashboard/AddNewExpeness';

const Product: NextPage = (props: any) => {
  const { shopId, rules } = props;
  const [cate, setCate] = useState<{ id: number; name: string; isNew: boolean }[]>([]);
  const [expensesList, setExpensesList] = useState<IExpenseList[]>([]);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpense, setIsAddExpense] = useState(false);
  const [key, setKey] = useState('list');
  const { locationSettings } = useContext(UserContext);

  const router = useRouter();
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    {
      field: 'amount',
      headerName: 'amount',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(row.amount).toFixed(locationSettings.currency_decimal_places),
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => row.created_at,
    },
    {
      field: 'attach',
      headerName: 'Attach File',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <ButtonGroup className="mb-2 m-buttons-style">
          {
            <Button>
              <FontAwesomeIcon icon={faPaperclip} />
            </Button>
          }
        </ButtonGroup>
      ),
    },
    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            {rules.hasEdit && (
              <Button
                onClick={() => {
                  setSelectId(row.id);
                  setIsAddExpense(true);
                }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
            {rules.hasDelete && (
              <Button
                onClick={() => {
                  setSelectId(row.id);
                  setShow(true);
                }}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
          </ButtonGroup>
        </>
      ),
    },
  ];
  async function initDataPage() {
    setIsLoading(true);
    const { success, newdata } = await apiFetchCtr({
      fetch: 'expenses',
      subType: 'getCateAndList',
      shopId,
    });
    console.log(success);
    console.log('result ', newdata);
    if (success) {
      rules.hasInsert && newdata.cate.push({ id: 0, name: '', isNew: true });
      setCate(newdata.cate);
      setExpensesList(newdata.list);
      setIsLoading(false);
    }
  }
  async function addUpdateExpense() {
    const { success, data } = await apiInsertCtr({
      type: 'expenses',
      subType: 'insetUpdateExpenes',
      data: cate,
      shopId,
    });
    if (!success) {
      Toastify('error', 'Has Error ,try Again');
      return;
    }
    let jj = 0;
    const _rows = [...cate];
    for (var j = 0; j < _rows.length - 1; j++) {
      _rows[j].isNew = false;
      if (_rows[j].id == 0) {
        _rows[j].id = data[jj];
        jj++;
      }
    }
    setCate(_rows);
    Toastify('success', 'successfuly Done!');
  }
  const handleInputChange = (e: any, i: number) => {
    const _rows = [...cate];
    _rows[i].name = e.target.value;

    var hasEmpty = false;
    for (var j = 0; j < _rows.length; j++) if (_rows[j].name.length == 0) hasEmpty = true;

    if (!hasEmpty) _rows.push({ id: 0, name: '', isNew: true });
    setCate(_rows);
  };
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton />
      </GridToolbarContainer>
    );
  }
  const onRowsSelectionHandler = (ids: any) => {
    console.log('ids', ids);
  };
  const handlebtnAdd = () => {
    setSelectId(0);
    setIsAddExpense(!isAddExpense);
  };
  useEffect(() => {
    initDataPage();
  }, [router.asPath]);
  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _data = [...expensesList];
      const idx = _data.findIndex((itm: any) => itm.id == selectId);
      console.log(idx, selectId);
      if (idx != -1) {
        _data.splice(idx, 1);
        setExpensesList(_data);
      }
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };
  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          id={selectId}
          alertFun={handleDeleteFuc}
          shopId={shopId}
          type="expenses"
          subType="deleteExpense">
          Are you Sure You Want Delete This Item ?
        </AlertDialog>
        <div className="row">
          <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k: any) => setKey(k)}
            className="mb-3 p-3">
            <Tab eventKey="list" title="List">
              <Card>
                <Card.Header className="p-3 bg-white">
                  <h5>Expense List</h5>
                </Card.Header>
                <Card.Body style={{ minHeight: '650px ' }}>
                  {!isLoading && rules.hasInsert && (
                    <div className="mb-2">
                      <button className="btn btn-primary p-3" onClick={() => handlebtnAdd()}>
                        {isAddExpense ? (
                          <>
                            <FontAwesomeIcon icon={faArrowAltCircleLeft} /> back{' '}
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faPlus} /> Add Expense{' '}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {!isAddExpense ? (
                    <>
                      <DataGrid
                        className="datagrid-style"
                        sx={{
                          '.MuiDataGrid-columnSeparator': {
                            display: 'none',
                          },
                          '&.MuiDataGrid-root': {
                            border: 'none',
                          },
                        }}
                        rows={expensesList}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
                        components={{ Toolbar: CustomToolbar }}
                      />
                    </>
                  ) : (
                    <AddNewExpeness
                      selectId={selectId}
                      setExpensesList={setExpensesList}
                      rows={expensesList}
                      setIsAddExpense={setIsAddExpense}
                      shopId={shopId}
                      cats={cate}
                    />
                  )}
                </Card.Body>
              </Card>
            </Tab>
            <Tab eventKey="category" title="Category">
              <Card>
                <Card.Header className="p-3 bg-white">
                  <h5>Expense List</h5>
                </Card.Header>
                <Card.Body className="table-responsive text-nowrap">
                  {!isLoading ? (
                    <Table className="table table-hover" responsive>
                      <thead className="thead-dark">
                        <tr>
                          <th style={{ width: '6%' }}>#</th>
                          <th>Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cate.map((ex: any, i: number) => {
                          return (
                            <tr key={i} style={{ background: ex.isNew ? '#c6e9e6' : '' }}>
                              <th scope="row">{i + 1}</th>
                              <td>
                                <input
                                  type="text"
                                  disabled={!rules.hasInsert}
                                  name="tax-name"
                                  className="form-control p-2"
                                  placeholder="Enter New Tax Name"
                                  value={ex.name}
                                  onChange={(e) => {
                                    handleInputChange(e, i);
                                  }}
                                />
                              </td>
                              <td>
                                <ButtonGroup className="mb-2 m-buttons-style">
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
                {rules.hasInsert && (
                  <div className="m-3">
                    <button
                      className="btn m-btn btn-primary p-3"
                      onClick={() => addUpdateExpense()}>
                      <FontAwesomeIcon icon={faFloppyDisk} /> save
                    </button>
                  </div>
                )}
              </Card>
            </Tab>
          </Tabs>
          {/* end */}
          <div className="col-md-12"></div>
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
  //local..../shop/2/tayloring
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
          const { userRules, hasPermission } = hasPermissions(_stuf, 'expanses');
          _rule = hasPermission;
          _userRules = userRules;
        } else _rule = false;
      }
    }
  );
  if (!_isOk) return { redirect: { permanent: false, destination: '/user/auth' } };
  if (!_rule) return { redirect: { permanent: false, destination: '/page403' } };

  //status ok
  return {
    props: { shopId, rules: _userRules },
  };
}
