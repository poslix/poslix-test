import type { NextPage } from 'next';
import { AdminLayout } from '@layout';
import Spinner from 'react-bootstrap/Spinner';
import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap';
import React, { useState, useEffect, useContext, Fragment, useMemo } from 'react';
import { apiFetchCtr } from '../../../../../libs/dbUtils';
import { useRouter } from 'next/router';
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import QRCode from 'react-qr-code';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbar,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faEye,
  faCheck,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from 'react-bootstrap';
import SalesListTable from 'src/components/dashboard/SalesListTable';
import OrdersTable from 'src/components/dashboard/OrdersTable';
import { findAllData } from 'src/services/crud.api';

ChartJS.register(ArcElement, Tooltip, Legend);

const Customer: NextPage = (props: any) => {
  const { shopId, rules, customerId } = props;
  const [key, setKey] = useState('profile');
  const [isOrder, setIsOrder] = useState(false);
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    // @ts-ignore
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const customerTemplate = {
    id: 0,
    first_name: '',
    last_name: '',
    mobile: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    shipping_address: '',
  };
  const [customerInfo, setCustomerInfo] = useState(customerTemplate);

  const data_bar = {
    labels: ['Paid', 'Unpaid', 'Partial', 'Canceled', 'Draft'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'customer_name', headerName: 'Customer Name', flex: 1 },
    { field: 'sale_date', headerName: 'Quotation Date', flex: 1 },
    {
      flex: 1,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (Number(+row.total_price - +row.amount) === 0) {
          return (
            <>
              <div className="sty_Accepted">Accepted</div>
            </>
          );
        } else if (Number(+row.total_price - +row.amount) === Number(row.total_price)) {
          return (
            <>
              <div className="sty_Cancled">Cancled</div>
            </>
          );
        } else {
          return (
            <>
              <div className="sty_Waiting">Waiting</div>
            </>
          );
        }
      },
    },
    {
      flex: 1,
      field: 'action',
      headerName: 'Action ',
      filterable: false,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button onClick={() => {}}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
            {rules.hasDelete && (
              <Button onClick={() => {}}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
            <Button onClick={() => {}}>
              <FontAwesomeIcon icon={faEye} />
            </Button>
            <Button onClick={() => {}}>
              <FontAwesomeIcon icon={faCheck} />
            </Button>
            <Button onClick={() => {}}>
              <FontAwesomeIcon icon={faXmark} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];

  const [sales, setSales] = useState<any>([]);
  // init sales data
  async function initDataPage() {
    if (router.query.customerId) {
      const res = await findAllData(`customers/${router.query.customerId}/show`);
      if (res.data.success) {
        setSales(res.data.result?.sales);
        setIsLoading(true);
        setCustomerInfo(customerTemplate);
        const selCustomer = res.data.result?.profile;
        setCustomerInfo({
          ...customerInfo,
          id: selCustomer.id,
          mobile: selCustomer.mobile,
          first_name: selCustomer.first_name,
          last_name: selCustomer.last_name,
          city: selCustomer.city,
          state: selCustomer.state,
          address_line_1: selCustomer.address_line_1,
          address_line_2: selCustomer.address_line_2,
          zip_code: selCustomer.zip_code,
          country: selCustomer.country,
          shipping_address: selCustomer.shipping_address,
        });
      } else {
        Toastify('error', 'has error, Try Again...');
      }
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let _locs = JSON.parse(localStorage.getItem('locations') || '[]');
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
    const order = localStorage.getItem('orders');
    if (order !== null) {
      setIsOrder(JSON.parse(order));
    }
  }, [router.asPath]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton />
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />

        {!isLoading ? (
          <>
            <Tabs
              id="controlled-tab-example"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-3">
              <Tab eventKey="profile" title="Profile">
                <Container fluid>
                  <Row>
                    <Col md={7}>
                      <Row>
                        <Col md={7}>
                          <div className="card">
                            <div className="card-body">
                              <h6 className="mb-3">
                                {customerInfo.first_name} {customerInfo.last_name}
                              </h6>
                              <h5>Last login</h5>
                            </div>
                          </div>
                        </Col>
                        <Col md={5}>
                          <div className="card">
                            <div className="card-body">
                              <h6 className="mb-3">Total Quotations</h6>
                              <h5>0</h5>
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col xs={12}>
                          <div className="card">
                            <div className="card-body">
                              <h5>Profile Info</h5>
                              <Container fluid>
                                <Row>
                                  <Col xs={12}>
                                    <h6 className="d-inline-block">First Name:</h6>{' '}
                                    {customerInfo.first_name}
                                  </Col>
                                  <Col xs={12}>
                                    <h6 className="d-inline-block">Last Name:</h6>{' '}
                                    {customerInfo.last_name}
                                  </Col>
                                  <Col xs={12}>
                                    <h6 className="d-inline-block">City:</h6> {customerInfo.city}
                                  </Col>
                                  <Col xs={12}>
                                    <h6 className="d-inline-block">State:</h6> {customerInfo.state}
                                  </Col>
                                  <Col xs={12}>
                                    <h6 className="d-inline-block">Address 1:</h6>{' '}
                                    {customerInfo.address_line_1}
                                  </Col>
                                  <Col xs={12}>
                                    <h6 className="d-inline-block">Address 2:</h6>{' '}
                                    {customerInfo.address_line_2}
                                  </Col>
                                  <Col xs={12}>
                                    <h6 className="d-inline-block">zip_code:</h6>{' '}
                                    {customerInfo.zip_code}
                                  </Col>
                                  <Col xs={12}>
                                    <h6 className="d-inline-block">country:</h6>{' '}
                                    {customerInfo.country}
                                  </Col>
                                  <Col xs={12}>
                                    <h6 className="d-inline-block">shipping_address:</h6>{' '}
                                    {customerInfo.shipping_address}
                                  </Col>
                                </Row>
                              </Container>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    <Col md={5}>
                      <Row>
                        <Col md={6}>
                          <div className="card">
                            <div className="card-body">
                              <h6 className="mb-3">Total Eranings</h6>
                              <h5>50</h5>
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="card">
                            <div className="card-body">
                              <h6 className="mb-3">Due Invoices</h6>
                              <h5>1</h5>
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <div className="card">
                          <div className="card-body">
                            <h1>Invoices</h1>
                            <div className="loc-dash-big-chart w-100">
                              <div>
                                <Pie
                                  data={data_bar}
                                  width={600}
                                  height={230}
                                  options={{ maintainAspectRatio: false }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Row>
                    </Col>
                  </Row>
                </Container>
              </Tab>
              <Tab eventKey="Quotations" title="Quotations">
                <div className="page-content-style card">
                  <h5>Quotations List</h5>
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
                    rows={sales}
                    columns={columns}
                    initialState={{
                      columns: { columnVisibilityModel: { mobile: false } },
                    }}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    components={{ Toolbar: CustomToolbar }}
                  />
                </div>
              </Tab>
              <Tab eventKey="Sales" title="Sales">
                <SalesListTable
                  shopId={router.query.id}
                  customerId={router.query.id}
                  salesList={sales}
                />
              </Tab>
              {isOrder && (
                <Tab eventKey="Orders" title="Orders">
                  <OrdersTable shopId={shopId} rules={rules} />
                </Tab>
              )}
              <Tab eventKey="loyaltycard" title="Loyalty card">
                <div className="card">
                  <div className="card-body">
                    <section className="punchcard-wrapper">
                      <header>
                        <p>BUY 9 SERVICES WITH US AND GET THE 10TH FREE!</p>
                      </header>

                      <figure className="punchcard">
                        <div className="punches" aria-labelledby="punchcard-summary">
                          <span className="punch punched" title="Punched"></span>
                          <span className="punch punched" title="Punched"></span>
                          <span className="punch punched" title="Punched"></span>
                          <span className="punch not-punched" title="Not Punched"></span>
                          <span className="punch not-punched" title="Not Punched"></span>
                          <span className="punch not-punched" title="Not Punched"></span>
                          <span className="punch not-punched" title="Not Punched"></span>
                          <span className="punch not-punched" title="Not Punched"></span>
                          <span className="punch not-punched" title="Not Punched"></span>
                          <span className="punch not-punched" title="Not Punched"></span>
                          <span className="punch not-punched" title="Not Punched"></span>
                          <span className="punch not-punched" title="Not Punched"></span>
                        </div>
                        <figcaption id="punchcard-summary">3 punched out of 12 total</figcaption>
                      </figure>

                      <footer>
                        <p>
                          Buy 11 calls, get the 12<sup>th</sup> free!
                        </p>
                      </footer>
                    </section>
                    <div className="text-center">
                      <QRCode value="Hey from Poslix" />
                    </div>
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
export default Customer;
