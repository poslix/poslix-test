import { NextPage } from 'next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-regular-svg-icons'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import {
  Button,
  Col, Container, Form, InputGroup, Row,
} from 'react-bootstrap'
import { SyntheticEvent, useState } from 'react'
import { useRouter } from 'next/router'

const Login: NextPage = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center dark:bg-transparent">
      <Container>
        <Row className="justify-content-center align-items-center px-3">
          <h2 style={{ textAlign: 'center' }}>Uh-oh Wrong Page!!</h2>
        </Row>
      </Container>
    </div>
  )
}

export default Login
