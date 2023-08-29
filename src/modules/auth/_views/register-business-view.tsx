import { joiResolver } from '@hookform/resolvers/joi';
import { BusinessTypeData } from '@models/data';
import { getSession, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import 'react-phone-number-input/style.css';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import { Toastify } from 'src/libs/allToasts';
import { createBusinessSchema } from 'src/modules/business/create-business/create-business.schema';
import { useBusinessTypesList } from 'src/services/business.service';
import api from 'src/utils/app-api';

type Inputs = {
  name: string;
  mobile: string;
  email: string;
  business_type_id: string | number;
};

export default function RegisterBusinessView() {
  const [busniessTypesList, setBusniessTypesList] = useState(BusinessTypeData());

  const router = useRouter();
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    mode: 'onTouched',
    resolver: joiResolver(createBusinessSchema),
    reValidateMode: 'onBlur',
  });

  useBusinessTypesList({
    onSuccess(data, key, config) {
      const _businessTypesList = data.result.map((itm: any) => ({
        value: itm.id,
        label: itm.name,
      }));
      setBusniessTypesList(_businessTypesList);
    },
  });

  const [isLoading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const _user = window.localStorage.getItem('uncompleted_user')
      ? JSON.parse(window.localStorage.getItem('uncompleted_user'))
      : null;
    if (!_user) {
      setLoading(false);
      Toastify('error', 'error occurred, try agian');
      router.reload();
    }
    api
      .postForm('/business', data, {
        headers: {
          Authorization: `Bearer ${_user.token}`,
        },
      })
      .then((res) => {
        Toastify('success', 'Business created successfully');
        window.localStorage.removeItem('uncompleted_user');
        setTimeout(() => {
          router.reload();
        }, 500);
      })
      .catch((err) => {
        Toastify('error', 'error occurred, try agian');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onError = (errors: any, e: any) => console.error(errors, e);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="p-2 my-2 d-flex gap-3 flex-column">
        <FormField
          label="Business Name"
          name="name"
          type="text"
          placeholder="Enter Business Name"
          register={register}
          required
          errors={errors}
        />
        <FormField
          label="Email"
          name="email"
          type="text"
          placeholder="Enter Email"
          register={register}
          required
          errors={errors}
        />
        <FormField
          label="Mobile"
          name="mobile"
          type="text"
          placeholder="Enter Mobile number"
          register={register}
          required
          errors={errors}
        />

        <SelectField
          label="Business Type"
          name="business_type_id"
          options={busniessTypesList} // Pass the business types options
          register={register}
          errors={errors}
          required
        />

        <button className="btn-login mt-auto" type="submit">
          {isLoading && (
            <Image
              alt="loading"
              width={25}
              height={25}
              className="login-loading"
              src="/images/loading.gif"
            />
          )}
          Create business
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
        redirect: { destination: `/${session.user.username}/business`, permenant: false },
        props: { session },
      };
    }
    return {
      redirect: { destination: '/shop', permenant: false },
      props: { session },
    };
  }

  return {
    props: {},
  };
}
