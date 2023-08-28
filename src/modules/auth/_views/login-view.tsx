import { joiResolver } from '@hookform/resolvers/joi';
import { getSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import loginSchema from '../login.schema';
import { Toastify } from 'src/libs/allToasts';
import { useRouter } from 'next/router';
import { findAllData } from 'src/services/crud.api';

type Inputs = {
  email: string;
  password: string;
};

const initState = {
  email: '',
  password: '',
};

export default function LoginView() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    mode: 'onTouched',
    resolver: joiResolver(loginSchema),
    reValidateMode: 'onBlur',
    defaultValues: initState,
  });
  const router = useRouter();

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const res = await signIn('credentials', { redirect: false, ...data })
      .then(async (res) => {
        if (res.error) throw new Error(res.error);
        const permissions = await findAllData('permissions')
        localStorage.setItem('permissions', JSON.stringify(permissions.data.result))

        Toastify('success', 'Login Success');
      })
      .catch(() => {
        Toastify('error', 'Login Failed');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onError = (errors: any, e: any) => console.log(errors, e);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="p-2 my-2 d-flex gap-3 flex-column">
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

        <Form.Group controlId="login-password-input">
          <Form.Label className="fw-semibold fs-6">Password</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              autoComplete="off"
              isInvalid={!!errors.password}
              placeholder="Enter Password"
              type={showPass ? 'text' : 'password'}
              name="password"
              {...register('password')}
            />
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '3rem',
              }}
              onClick={() => setShowPass((p) => !p)}>
              {showPass ? <MdVisibility /> : <MdVisibilityOff />}
            </Button>
          </InputGroup>
          {errors?.password ? (
            <Form.Text className="text-danger">{errors?.password?.message}</Form.Text>
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
          Sign in
        </button>
      </div>
    </Form>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  if (session) {
    if (session.user.user_type === 'owner' && session.user.business > 0) {
      return {
        redirect: { destination: '/' + session.user.username + '/business', permenant: false },
        props: { session },
      };
    } else if (session.user.user_type === 'user') {
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
