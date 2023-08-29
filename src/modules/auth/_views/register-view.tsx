import { joiResolver } from '@hookform/resolvers/joi';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { Dispatch, SetStateAction, useState } from 'react';
import { Form } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import { handleAxiosError } from 'src/components/backend-response-handlers/axios-error-handler';
import ErrorHandler from 'src/components/backend-response-handlers/error-handler';
import FormField from 'src/components/form/FormField';
import PasswordField from 'src/components/form/PasswordField';
import { Toastify } from 'src/libs/allToasts';
import api from 'src/utils/app-api';
import { registerFields } from '../_fields/register-fields';
import registerSchema from '../register.schema';

import 'react-phone-number-input/style.css';

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

export default function RegisterView({
  setIsRegisterDone,
}: {
  setIsRegisterDone: Dispatch<SetStateAction<boolean>>;
}) {
  const [error, setError] = useState<string[]>([]);

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

  const [isLoading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const { repeat_password, ..._data } = data;
    api
      .post('/register', _data)
      .then((res) => {
        console.log(res);
        const _user = {
          ...res.data.result.user,
          token: res.data.result.authorization.token,
        };
        window.localStorage.setItem('uncompleted_user', JSON.stringify(_user));
        Toastify('success', 'Register Success');
        setTimeout(() => {
          setIsRegisterDone(true);
        }, 500);
      })
      .catch((err) => {
        handleAxiosError(err, setError);
        Toastify('error', err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onError = (errors: any, e: any) => console.error(errors, e);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="p-1 mt-3">
        <ErrorHandler error={error} />
      </div>

      <div className="p-2 my-2 d-flex gap-3 flex-column">
        {registerFields.map((field) => {
          if (field.type === 'password')
            return (
              <PasswordField
                key={field.name}
                {...field}
                register={register}
                errors={errors}
                control={control}
              />
            );
          return (
            <FormField
              key={field.name}
              {...field}
              register={register}
              errors={errors}
              control={control}
            />
          );
        })}

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
