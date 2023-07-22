import { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap'
import { apiFetch } from "src/libs/dbUtils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPenToSquare, faPlus, faStreetView, faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { redirectToLogin } from '../../libs/loginlib'
import { OwnerAdminLayout } from "@layout";
const BusinessList = () => {

    const [business, setBusiness] = useState<{ id: number, name: string }[]>([])
    async function initDataPage() {
        const { success, newdata } = await apiFetch({ fetch: 'getBusiness' })
        console.log(success);
        if (!success) {
            redirectToLogin()
            return
        }
        setBusiness(newdata)
        console.log("result ", newdata);

    }
    useEffect(() => {
        initDataPage();
    }, [])

    return (
        <>
            <OwnerAdminLayout>
                <div className="row">
                    <div className="col-md-12">

                        <Card >
                            <Card.Header className="p-3 bg-white">
                                <h5>My Business List</h5>
                            </Card.Header>
                            <Card.Body className='table-responsive text-nowrap'>
                                {business.length > 0 ? <Table className="table table-hover" responsive>
                                    <thead className="thead-dark">
                                        <tr>
                                            <th style={{ width: '6%' }} >#</th>
                                            <th>Name</th>
                                            <th>type</th>
                                            <th>Locations</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            business.map((busi: any, i: number) => {
                                                return (
                                                    <tr key={i}>
                                                        <th scope="row">{i + 1}</th>
                                                        <td>{busi.type}</td>
                                                        <td>{busi.name}</td>
                                                        <td>{busi.name}</td>
                                                        <td><ButtonGroup className="mb-2 m-buttons-style">
                                                            <Button onClick={() => {
                                                                console.log("this item ", busi.id);
                                                                // redirectToLogin('/shop/' + busi.id + '/products/')
                                                                redirectToLogin('/products/')
                                                            }}><FontAwesomeIcon icon={faFolderOpen} />
                                                            </Button>
                                                        </ButtonGroup></td>
                                                    </tr>)
                                            })
                                        }
                                    </tbody>
                                </Table>
                                    : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </OwnerAdminLayout>
        </>
    )
}
export default BusinessList;