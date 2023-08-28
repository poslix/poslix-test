import { BusinessTypeData } from '@models/data';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { default as BsImage } from 'react-bootstrap/Image';
import { SubmitHandler, useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import { Toastify } from 'src/libs/allToasts';
import { useBusinessTypesList, useCurrenciesList } from 'src/services/business.service';
import { authApi } from 'src/utils/auth-api';
import styles from './add-location.module.scss';

type Inputs = {
  name: string;
  state: string;

  currency_id: number;
  business_id: number;
  decimal: number;
};
interface Props {
  businessId?: string;
}

export default function AddBusinessLocationView({ businessId = '0' }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const [isLoading, setLoading] = useState(false);
  const [busniessTypesList, setBusniessTypesList] = useState(BusinessTypeData());
  const [countries, setCountries] = useState<{ value: number; label: string }[]>([]);
  const [currencies, setCurrencies] = useState<{ value: number; label: string }[]>([]);
  useCurrenciesList(null, {
    onSuccess(data) {
      const _countriesList = data.result.map((itm: any) => {
        return { value: itm.id, label: itm.country };
      });
      const _currenciesList = data.result.map((itm: any) => {
        return { value: itm.id, label: itm.currency };
      });

      setCountries(_countriesList);
      setCurrencies(_currenciesList);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Inputs>({
    mode: 'onTouched',
    // resolver: joiResolver(createBusinessSchema),
    reValidateMode: 'onBlur',
    defaultValues: {
      name: '',
      state: '',
      decimal: 1,
      currency_id: 0,
      business_id: +businessId,
    },
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
      .postForm('/business/locations', data)
      .then((res) => {
        Toastify('success', 'Location created successfully');
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

  useEffect(() => {
    setValue('business_id', +businessId);
  }, [businessId]);
  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit, onError)} className={styles.form}>
      <div className={styles['form-image__container']}>
        <BsImage
          fluid
          alt="createLocation"
          className={styles['form-image']}
          src="https://static.vecteezy.com/system/resources/previews/012/024/324/original/a-person-using-a-smartphone-to-fill-out-a-registration-form-registration-register-fill-in-personal-data-use-the-application-vector.jpg"
        />
      </div>
      <div className="p-2 my-2 d-flex gap-3 flex-column">
        <FormField
          label="Location Name"
          name="name"
          type="text"
          placeholder="Enter Location Name"
          register={register}
          required
          errors={errors}
        />
        <FormField
          label="State"
          name="state"
          type="text"
          placeholder="Enter State"
          register={register}
          required
          errors={errors}
        />
        <FormField
          label="Decimal Points"
          name="decimal"
          type="number"
          placeholder="Enter Decimal Number"
          register={register}
          required
          errors={errors}
        />
        <SelectField
          label="Currency"
          name="currency_id"
          options={currencies} // Pass the business types options
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
              src={'/images/loading.gif'}
            />
          )}
          Create location
        </button>
      </div>
    </Form>
  );
}
