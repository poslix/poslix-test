import { getSession } from 'next-auth/react';
import { ROUTES } from 'src/utils/app-routes';

export default function Home() {
  return (
    <div>
      <style jsx>{`
        div {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 40vh;
        }
      `}</style>
      Loading...
    </div>
  );
}

// # this is the new redirect method
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
    redirect: { destination: ROUTES.AUTH, permenant: false },
    props: { session },
  };
}
