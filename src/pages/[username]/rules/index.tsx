import { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap'
import { apiFetch } from "src/libs/dbUtils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPenToSquare, faPlus, faStreetView, faFolderOpen, faGear, faEdit, faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons'
import { getmyUsername, redirectToLogin } from '../../../libs/loginlib'
import { OwnerAdminLayout } from "@layout";
import AddNewRole from "src/components/dashboard/AddNewRole";
import { IRoles } from "@models/common-model";
import { verifayTokens } from "src/pages/api/checkUtils";
import { ITokenVerfy } from "@models/common-model";
import * as cookie from 'cookie'
const Roles = ({ username }: any) => {

    const [stuffs, setStuffs] = useState<IRoles[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddNew, setIsAddNew] = useState(false)

    const [selectedId, setSelectedId] = useState(0)
    async function initDataPage() {
        const { success, newdata } = await apiFetch({ fetch: 'getStuffsMyBusiness' })
        if (!success) {
            redirectToLogin()
            return
        }
        setStuffs(newdata.myStuffs)
        setIsLoading(false)
    }
    function showPropryRoles_test(roles: string) {
        if (roles === "no") {
            return (<div className="roles-parent-no-peri" ><div>No Permissions</div></div>)
        } else {
            const _roles = roles.replaceAll('_r', '_read').replaceAll('_e', '_edit').replaceAll('_d', '_delete').replaceAll('_i', '_insert').split(',');

            return (<div className="roles-parent">
                {_roles.map((mp) => {
                    return mp.length > 0 && <div>{mp}</div>
                })}
            </div>)
        }
    }
    useEffect(() => {
        initDataPage()
    }, [])

    return (
        <>
            <OwnerAdminLayout>
                <button className='mb-4 btn btn-primary p-3' style={{ width: '150px' }} onClick={() => {
                    setSelectedId(-1)
                    setIsAddNew(!isAddNew)
                }}><FontAwesomeIcon icon={!isAddNew ? faPlus : faArrowAltCircleLeft} /> {!isAddNew ? 'Add Role' : 'Back'}</button>
                {isAddNew && <AddNewRole setIsAddNew={setIsAddNew} stuffs={stuffs} index={selectedId} />}
                {!isAddNew && <div className="row">
                    <div className="col-md-12">
                        <Card>
                            <Card.Header className="p-3 bg-white">
                                <h5>Rules </h5>
                            </Card.Header>
                            <Card.Body >
                                {!isLoading ? <Table className="table table-hover" responsive>
                                    <thead className="thead-dark">
                                        <tr>
                                            <th style={{ width: '6%' }} >#</th>
                                            <th>Name</th>
                                            <th>Stuff</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            stuffs.map((user: any, i: number) => {
                                                return (
                                                    <tr>
                                                        <th scope="row">{i + 1}</th>
                                                        <th>{user.name}</th>
                                                        <td>{showPropryRoles_test(user.stuff)}</td>
                                                        <td><ButtonGroup className="mb-2 m-buttons-style">
                                                            <Button onClick={() => { }}><FontAwesomeIcon icon={faTrash} /></Button>
                                                            <Button onClick={() => {
                                                                setSelectedId(i)
                                                                setIsAddNew(true)
                                                            }}><FontAwesomeIcon icon={faEdit} /></Button>
                                                        </ButtonGroup></td>
                                                    </tr>
                                                )
                                            })

                                        }
                                    </tbody>
                                </Table>
                                    : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
                            </Card.Body>
                        </Card>
                    </div>
                </div>}
            </OwnerAdminLayout>
        </>
    )
}
export default Roles;
export async function getServerSideProps(context: any) {
    if (context.query.username == undefined) {
        return {
            redirect: {
                permanent: false, destination: "/user/login"
            }
        }
    }
    //check token
    let _isOk = true
    const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
    await verifayTokens({ headers: { authorization: 'Bearer ' + parsedCookies.tokend } }, (repo: ITokenVerfy) => {
        _isOk = repo.status;
    })
    if (!_isOk) return { redirect: { permanent: false, destination: "/user/login" } }
    //end

    let username = getmyUsername(context.query);
    return {
        props: { username },
    };
}