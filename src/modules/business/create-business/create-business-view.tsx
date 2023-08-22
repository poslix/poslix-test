import { joiResolver } from '@hookform/resolvers/joi';
import { BusinessTypeData } from '@models/data';
import Image from 'next/image';
import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import { useBusinessTypesList, useCurrenciesList } from 'src/services/business.service';
import { createBusinessSchema } from './create-business.schema';
import { default as BsImage } from 'react-bootstrap/Image';
import styles from './create-business.module.scss';
import { authApi } from 'src/utils/auth-api';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Toastify } from 'src/libs/allToasts';
import { useRouter } from 'next/router';

type Inputs = {
  name: string;
  mobile: string;
  email: string;
  business_type_id: string | number;
};

export default function CreateBusinessView() {
  const router = useRouter();
  const { data: session } = useSession();

  const [isLoading, setLoading] = useState(false);
  const [busniessTypesList, setBusniessTypesList] = useState(BusinessTypeData());
  const [countries, setCountries] = useState<{ value: number; label: string }[]>([]);
  const { currenciesList } = useCurrenciesList(null, {
    onSuccess(data, key, config) {
      const _countriesList = data.result.map((itm: any) => {
        return { value: itm.id, label: itm.country };
      });
      setCountries(_countriesList);
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    mode: 'onTouched',
    resolver: joiResolver(createBusinessSchema),
    reValidateMode: 'onBlur',
  });

  const { businessTypesList } = useBusinessTypesList({
    onSuccess(data, key, config) {
      const _businessTypesList = data.result.map((itm: any) => {
        return { value: itm.id, label: itm.name };
      });
      setBusniessTypesList(_businessTypesList);
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    (await authApi(session))
      .postForm('/business', data)
      .then((res) => {
        Toastify('success', 'Business created successfully');
        router.push('/[username]/business', `/${session?.user?.username}/business`);
      })
      .catch((err) => {
        Toastify('error', 'error occurred, try agian');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onError = (errors: any, e: any) => console.log(errors, e);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit, onError)} className={styles.form}>
      <div className={styles['form-image__container']}>
        <BsImage
          fluid
          alt="createBusiness"
          className={styles['form-image']}
          src="https://static.vecteezy.com/system/resources/previews/012/024/324/original/a-person-using-a-smartphone-to-fill-out-a-registration-form-registration-register-fill-in-personal-data-use-the-application-vector.jpg"
        />
      </div>
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
        {/* <FormField
          label="Decimal Points"
          name="decimal"
          type="number"
          placeholder="Enter Mobile number"
          register={register}
          required
          errors={errors}
        /> */}
        <SelectField
          label="Business Type"
          name="business_type_id"
          options={busniessTypesList} // Pass the business types options
          register={register}
          errors={errors}
          required
        />
        {/* <SelectField
          label="Country"
          name="country_id"
          options={countries} // Pass the business types options
          register={register}
          errors={errors}
          required
        /> */}
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
          Create business
        </button>
      </div>
    </Form>
  );
}
