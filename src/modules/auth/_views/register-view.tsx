import { joiResolver } from '@hookform/resolvers/joi';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import registerSchema from '../register.schema';

import 'react-phone-number-input/style.css';
import { Toastify } from 'src/libs/allToasts';
import api from 'src/utils/app-api';
import { ROUTES } from 'src/utils/app-routes';

type Inputs = {
  first_name: string;
  last_name: string;
  number: string;
  email: string;
  password: string;
  repeat_password: string;
};

const initState = {
  email: '',
  first_name: '',
  last_name: '',
  number: '',
  password: '',
  repeat_password: '',
};

export default function RegisterView() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    mode: 'onTouched',
    resolver: joiResolver(registerSchema),
    reValidateMode: 'onBlur',
    defaultValues: initState,
  });

  const [showPass, setShowPass] = useState({
    password: false,
    repeat_password: false,
  });
  const [isLoading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const { repeat_password, ..._data } = data;
    api
      .post('/register', _data)
      .then((res) => {
        Toastify('success', 'Register Success');
        setTimeout(() => {
          window.location.href = ROUTES.AUTH;
        }, 1000);
      })
      .catch((err) => {
        Toastify('error', err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onError = (errors: any, e: any) => console.error(errors, e);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="p-2 my-2 d-flex gap-3 flex-column">
        <Form.Group controlId="login-first__name-input">
          <Form.Label className="fw-semibold fs-6">First name</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              isInvalid={!!errors.first_name}
              autoComplete="off"
              placeholder="Enter First Name"
              type="text"
              name="first_name"
              {...register('first_name')}
            />
          </InputGroup>
          {errors?.first_name ? (
            <Form.Text className="text-danger">{errors?.first_name?.message}</Form.Text>
          ) : null}{' '}
        </Form.Group>
        <Form.Group controlId="login-last__name-input">
          <Form.Label className="fw-semibold fs-6">Last name</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              isInvalid={!!errors.last_name}
              autoComplete="off"
              placeholder="Enter Last Name"
              type="text"
              name="last_name"
              {...register('last_name')}
            />
          </InputGroup>
          {errors?.last_name ? (
            <Form.Text className="text-danger">{errors?.last_name?.message}</Form.Text>
          ) : null}{' '}
        </Form.Group>
        <Form.Group controlId="login-email-input">
          <Form.Label className="fw-semibold fs-6">Email</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              isInvalid={!!errors.email}
              autoComplete="off"
              placeholder="Enter Email"
              type="text"
              name="email"
              {...register('email')}
            />
          </InputGroup>
          {errors?.email ? (
            <Form.Text className="text-danger">{errors?.email?.message}</Form.Text>
          ) : null}{' '}
        </Form.Group>

        <Form.Group controlId="login-number-input">
          <Form.Label className="fw-semibold fs-6">Phone Number</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              isInvalid={!!errors.number}
              autoComplete="off"
              placeholder="Enter Phone Number"
              type="text"
              name="number"
              {...register('number')}
            />
          </InputGroup>
          {errors?.number ? (
            <Form.Text className="text-danger">{errors?.number?.message}</Form.Text>
          ) : null}{' '}
        </Form.Group>

        <Form.Group controlId="login-password-input">
          <Form.Label className="fw-semibold fs-6">Password</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              autoComplete="off"
              isInvalid={!!errors.password}
              placeholder="Enter Password"
              type={showPass.password ? 'text' : 'password'}
              name="password"
              {...register('password')}
            />
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '3rem',
              }}
              onClick={() => setShowPass((p) => ({ ...p, password: !p.password }))}>
              {showPass.password ? <MdVisibility /> : <MdVisibilityOff />}
            </Button>
          </InputGroup>
          {errors?.password ? (
            <Form.Text className="text-danger">{errors?.password?.message}</Form.Text>
          ) : null}
        </Form.Group>

        <Form.Group controlId="login-re_password-input">
          <Form.Label className="fw-semibold fs-6">Confirm Password</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              autoComplete="off"
              isInvalid={!!errors.repeat_password}
              placeholder="Enter Password"
              type={showPass.repeat_password ? 'text' : 'password'}
              name="repeat_password"
              {...register('repeat_password')}
            />
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '3rem',
              }}
              onClick={() => setShowPass((p) => ({ ...p, repeat_password: !p.repeat_password }))}>
              {showPass.repeat_password ? <MdVisibility /> : <MdVisibilityOff />}
            </Button>
          </InputGroup>
          {errors?.repeat_password ? (
            <Form.Text className="text-danger">{errors?.repeat_password?.message}</Form.Text>
          ) : null}
        </Form.Group>
        <button className="btn-login mt-auto" type="submit">
          {isLoading && (
            <Image
              alt="loading"
              width={25}
              height={25}
              className="login-loading"
              src={'/images/loading.gif'}
            />
          )}
          Register{' '}
        </button>
      </div>
    </Form>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  if (session) {
    if (session.user.user_type === 'owner') {
      return {
        redirect: { destination: '/' + session.user.username + '/business', permenant: false },
        props: { session },
      };
    } else {
      return {
        redirect: { destination: '/shop', permenant: false },
        props: { session },
      };
    }
  }

  return {
    props: {},
  };
}
