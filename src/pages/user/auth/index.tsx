import DarkModeToggle from '@layout/AdminLayout/DarkModeToggle';
import { IUserBusiness } from '@models/auth.types';
import { ICustomResponse } from '@models/global.types';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { setCookie } from 'cookies-next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import 'react-phone-input-2/lib/style.css';
import { darkModeContext } from 'src/context/DarkModeContext';
import { useUser } from 'src/context/UserContext';
import LoginView from 'src/modules/auth/_views/login-view';
import RegisterBusinessView from 'src/modules/auth/_views/register-business-view';
import RegisterView from 'src/modules/auth/_views/register-view';
import api from 'src/utils/app-api';
import { ELocalStorageKeys } from 'src/utils/app-constants';

const initalInputState = {
  id: '',
  username: '',
  password: '',
  name: '',
  phone: '',
  mail: '',
  businessname: '',
  businesstype: 0,
};

export default function RegisterPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { data: session } = useSession();
  const { darkMode } = useContext(darkModeContext);

  const [isRegisterDone, setIsRegisterDone] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(true);

  const RenderForm = () => {
    if (isRegisterDone) return <RegisterBusinessView />;
    if (showLoginDialog) return <LoginView />;
    return <RegisterView setIsRegisterDone={setIsRegisterDone} />;
  };

  async function getBusiness(user) {
    const { data } = await api.get<any, AxiosResponse<ICustomResponse<IUserBusiness>>, any>(
      '/business'
    );

    const { result } = data;
    const { locations } = result;
    localStorage.setItem(ELocalStorageKeys.USER_LOCATIONS, JSON.stringify(locations));
    if (user.user_type === 'user') {
      router.push('/shop/' + result[0].id);
    } else router.push('/' + user.username + '/business');
  }

  useEffect(() => {
    if (session) {
      const { user } = session;

      setCookie('tokend', user.token);
      setUser(user);

      localStorage.setItem('userdata', JSON.stringify(user));
      localStorage.setItem(ELocalStorageKeys.TOKEN, user.token);
      localStorage.setItem(
        ELocalStorageKeys.FULL_NAME,
        `${user.first_name} ${user.last_name ?? ''}`
      );
      localStorage.setItem(ELocalStorageKeys.USER_NAME, user.username);
      localStorage.setItem(ELocalStorageKeys.LEVELS, user.user_type);

      if (user.user_type === 'owner') getBusiness(user);
    }
  }, [session]);

  // if the user already logged then redirect to another page

  if (user?.user_type === 'owner') {
    getBusiness(user);
  }

  return (
    <div>
      <style jsx>{`
        .login-body {
          transition: background-color 0.3s ease-in-out;
        }
        .card {
          border-radius: 1rem;
          overflow: hidden;
          .form {
            min-height: 70vh;
            max-height: 90vh;

            .form-item.right-side {
              max-height: 100%;
              overflow-y: auto;
            }
          }
        }
      `}</style>

      <div className="position-absolute m-3 end-0">
        <DarkModeToggle />
      </div>
      <div
        className={clsx('login-body', {
          'dark-mode-body': darkMode,
          'light-mode-body': !darkMode,
        })}>
        <div className="container-login">
          <div className="card">
            <div className="form">
              <div className="form-item left-side">
                <img src="https://app.dubbpie.com/assets/images/login-img.png" />
                <div className="login-ads-text">
                  <h3>Manage Your Business</h3>
                  <p>
                    Easily manage your store with
                    <br /> POSLIX POS Screen
                  </p>
                </div>
                <div className="login-footer-dots">
                  <div className="footer-arrows">⮜</div>
                  <div className="footer-dots">
                    <div className="footer-dots-item"></div>
                    <div className="footer-dots-item active"></div>
                    <div className="footer-dots-item"></div>
                  </div>
                  <div className="footer-arrows">⮞</div>
                </div>
              </div>
              <div className="form-item right-side">
                <div className="login-logo-box">
                  <img src="/images/logo1.png" />
                </div>
                {!isRegisterDone && (
                  <div className="login-register-box">
                    <h3>Welcome Back</h3>
                    <p>To Start Working, First Login Or Register</p>
                    <div className="switcher-box">
                      <div
                        className={`switcher-box-item ${showLoginDialog ? 'active' : ''}`}
                        onClick={() => setShowLoginDialog(true)}>
                        Login In
                      </div>
                      <div
                        className={`switcher-box-item ${!showLoginDialog ? 'active' : ''}`}
                        onClick={() => setShowLoginDialog(false)}>
                        Sign Up
                      </div>
                    </div>
                  </div>
                )}

                <RenderForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
