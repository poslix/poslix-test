import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from 'src/context/UserContext';
import { ROUTES } from 'src/utils/app-routes';
import { Bars } from 'react-loader-spinner';

/**
 * This HOC is used to check if the user is logged in or not.\
 * If the user is not logged in, it will redirect to the login page.
 *
 * Usage:
 *  import withAuth from 'src/HOCs/withAuth';
 * const MyPage = () => {
 *  return <div>My Page</div>
 * }
 * export default withAuth(MyPage);
 *
 */

export default function withAuth(Component) {
  return (props) => {
    // const router = useRouter();

    const { user } = useUser();

    // useEffect(() => {
    //   console.log(user.username);
    //   if (!user.username) {
    //     router.push(ROUTES.AUTH);
    //   }
    // }, [user]);

    // if (!user.username) {
    //   return (
    //     <div className="loader-container">
    //       <style jsx>{`
    //         .loader-container {
    //           width: 100vw;
    //           height: 100vh;
    //           display: flex;
    //           justify-content: center;
    //           align-items: center;
    //         }
    //       `}</style>
    //       <Bars
    //         height="80"
    //         width="80"
    //         color="#4fa94d"
    //         ariaLabel="bars-loading"
    //         wrapperStyle={{}}
    //         wrapperClass=""
    //         visible={true}
    //       />
    //     </div>
    //   );
    // }
    return <Component {...props} user={user} />;
  };
}
