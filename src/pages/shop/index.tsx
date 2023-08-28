import axios from 'axios';
import { getSession } from 'next-auth/react';
import { ROUTES } from 'src/utils/app-routes';

export default function Shop({ user, shopId }) {
  return (
    <div>
      <h1>Shop</h1>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      props: {},
      redirect: {
        permanent: false,
        destination: ROUTES.AUTH,
      },
    };
  }

  if (session.user.user_type === 'user') {
    try {
      const locationResponse = await axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE}business/locations`, {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        })
        .then((res) => res.data);
      const location = locationResponse.result[0];

      if (!location || !location?.location_id)
        return {
          props: {},
          redirect: {
            permanent: false,
            destination: '/page403',
          },
        };

      return {
        props: { user: session?.user, shopId: location.location_id, location },
        redirect: {
          permanent: false,
          destination: `/shop/${location.location_id}`,
        },
      };
    } catch (e) {
      return {
        props: { error: e },
        redirect: {
          permanent: false,
          destination: '/page403',
        },
      };
    }
  } else if (session.user.user_type === 'owner' && !context?.query?.shopId) {
    return {
      props: {},
      redirect: {
        permanent: false,
        destination: '/page403',
      },
    };
  }

  return {
    props: { user: session?.user },
  };
}
