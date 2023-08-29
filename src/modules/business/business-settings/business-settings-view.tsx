import { type IUserBusiness } from '@models/auth.types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Card, Form, Tabs } from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import styles from './business-settings.module.scss';
import UpdateBusinessSettings from 'src/pages/[username]/business/[id]/settings';
import businessService, { useCurrenciesList } from 'src/services/business.service';
import { Toastify } from 'src/libs/allToasts';
import { useSWRConfig } from 'swr';
import SelectField from 'src/components/form/SelectField';

function LocationUpdateForm({ businessId, location }) {
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();
  const [currenciesList, setCurrenciesList] = useState<{ value: number; label: string }[]>([]);
  const { isLoading: currenciesLoading } = useCurrenciesList(null, {
    onSuccess(data, key, config) {
      const _currenciesList = data.result.map((itm: any) => {
        return { value: itm.id, label: `${itm.country} (${itm.code})` };
      });

      setCurrenciesList(_currenciesList);
    },
  });

  const {
    register: locationRegister,
    handleSubmit: handleLocationSubmit,
    formState: { errors: locationErrors },
    setValue: setLocationValue,
    clearErrors: clearLocationErrors,
  } = useForm({
    shouldUnregister: false,
    defaultValues: {
      name: location.location_name,
      currency_id: location.currency_id,
      decimal: location.location_decimal_places,
    },
  });

  function onLocationSubmit(data: any) {
    setLoading(true);
    businessService
      .updateLocationSettings(location.location_id, data)
      .then((res) => {
        Toastify('success', 'Location Settings Updated Successfully');

        mutate(`/business/${businessId}`);
      })
      .catch((err) => {
        Toastify('error', 'Error Updating Location Settings');
      })
      .finally(() => {
        setLoading(false);
      });
  }
  const onLocationError = (errors: any, e: any) => console.error(errors, e);
  return (
    <Form
      key={`${location.location_id}-form--location`}
      noValidate
      onSubmit={handleLocationSubmit(onLocationSubmit, onLocationError)}
      className={styles.form}>
      <FormField
        required
        name="name"
        type="text"
        label="Location Name"
        placeholder="Enter Location Name"
        errors={locationErrors}
        register={locationRegister}
      />
      <SelectField
        label="Currency"
        name="currency_id"
        options={currenciesList}
        register={locationRegister}
        errors={locationErrors}
        required
        loading={currenciesLoading}
      />
      <FormField
        required
        name="decimal"
        type="number"
        label="Decimal Places"
        placeholder="Enter Decimal Places"
        errors={locationErrors}
        register={locationRegister}
      />

      <button className="btn-login mt-auto" type="submit" disabled={loading}>
        {!!loading && (
          <Image
            alt="loading"
            width={25}
            height={25}
            className="login-loading"
            src={'/images/loading.gif'}
          />
        )}
        Update Location Settings
      </button>
    </Form>
  );
}

export default function BusinessSettingsView({
  username,
  business,
}: {
  business: IUserBusiness;
  username: string;
}) {
  const { mutate } = useSWRConfig();

  const [key, setKey] = useState<string | number>(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: business.name,
      type: business.type,

      email: business.email,
    },
  });

  function onSubmit(data: any) {
    setLoading(true);
    businessService
      .updateBusinessSettings(business.id, data)
      .then((res) => {
        Toastify('success', 'Business Settings Updated Successfully');

        mutate(`/business/${business.id}`);
      })
      .catch((err) => {
        Toastify('error', 'Error Updating Business Settings');
      })
      .finally(() => {
        setLoading(false);
      });
  }
  const onError = (errors: any, e: any) => console.error(errors, e);

  return (
    <Tabs
      id="business-settings-tabs"
      fill
      activeKey={key}
      onSelect={(k) => setKey(k)}
      className="mb-3">
      <Tab eventKey={0} title="General">
        <Card>
          <Card.Header className="p-3 bg-white">
            <h5>General Settings for {business.name}</h5>
          </Card.Header>
          <Card.Body>
            <Form
              key={1}
              noValidate
              onSubmit={handleSubmit(onSubmit, onError)}
              className={styles.form}>
              <FormField
                label="Business Type"
                name="type"
                type="text"
                register={register}
                errors={errors}
                placeholder="Enter Business Type"
                disabled
              />
              <FormField
                label="Business Name"
                name="name"
                type="text"
                placeholder="Enter Business Name"
                required
                register={register}
                errors={errors}
              />
              <FormField
                label="Business Email"
                name="email"
                type="text"
                placeholder="Enter Business Email"
                required
                register={register}
                errors={errors}
              />
              <button className="btn-login mt-auto" type="submit" disabled={loading}>
                {!!loading && (
                  <Image
                    alt="loading"
                    width={25}
                    height={25}
                    className="login-loading"
                    src={'/images/loading.gif'}
                  />
                )}
                Update Settings
              </button>
            </Form>
          </Card.Body>
        </Card>
      </Tab>
      {business.locations?.map((location) => {
        return (
          <Tab
            key={location.location_id}
            eventKey={location.location_id}
            title={location.location_name}>
            <Card>
              <Card.Header className="p-3 bg-white">
                <h6 className={styles['location-header']}>
                  General settings for {location.location_name}
                </h6>
              </Card.Header>
              <Card.Body>
                <LocationUpdateForm businessId={business.id} location={location} />
              </Card.Body>
            </Card>
          </Tab>
        );
      })}
    </Tabs>
  );
}
