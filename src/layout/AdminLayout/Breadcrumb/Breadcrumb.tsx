import { Breadcrumb as BSBreadcrumb } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useState, useMemo, useEffect, useContext } from 'react';
import Select, { StylesConfig } from 'react-select';
import { redirectToLogin } from 'src/libs/loginlib';
import { UserContext } from 'src/context/UserContext';

/*MOHAMMED MAHER */
import { darkModeContext } from 'src/context/DarkModeContext';

export default function Breadcrumb(props: any) {
  const { shopId } = props;
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<any>([]);
  const [locations, setLocations] = useState<{ value: number; label: string }[]>([]);
  const [locationIndex, setLocationIndex] = useState<number>(-1);
  const [currentPageName, setCurrentPageName] = useState('products');
  const [isSlug, setIsSlug] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const { darkMode } = useContext(darkModeContext);

  const linkPath: string[] = router.asPath.split('/');
  linkPath.shift();
  const pathArray = linkPath.map((path, i) => {
    return { breadcrumb: path, href: '/' + linkPath.slice(0, i + 1).join('/') };
  });

  useEffect(() => {
    setBreadcrumbs(pathArray);
    if (linkPath.length > 2) setCurrentPageName(linkPath[2]);
    if (linkPath.length > 3) setIsSlug(true);
    const _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    setLocations(_locs);
    setLocationIndex(
      _locs.findIndex((loc: any) => {
        return loc.value == shopId;
      })
    );
  }, [router.asPath]);
  return (
    <div className="breadcrumb-style bg-white  ">
      <div className="ineer-breadcrumb-style" style={{ marginRight: '70%' }}>
        {!isSlug && locations.length > 1 && (
          <Select
            className={`mt-3 ${darkMode ? 'dark-mode-body' : 'light-mode-body'}`}
            options={locations}
            value={locations[locationIndex]}
            onChange={(itm: any) => {
              setUser(itm);
              redirectToLogin('/shop/' + itm!.value + '/' + currentPageName);
            }}
          />
        )}
      </div>
      <BSBreadcrumb
        listProps={{
          className: `my-0  align-items-center breadcrumb-m ${
            darkMode ? 'dark-mode-body' : 'light-mode-body'
          }`,
        }}>
        <BSBreadcrumb.Item active linkProps={{ className: 'text-decoration-none' }} href={'/'}>
          {locations.length > 0 && locationIndex > -1 && locations[locationIndex].label}
        </BSBreadcrumb.Item>
        {breadcrumbs &&
          breadcrumbs.map((br: any, i: number) => {
            return (
              i > 1 &&
              i < 4 && (
                <BSBreadcrumb.Item
                  key={i}
                  active={breadcrumbs.length - 1 == i ? true : i == 3 ? true : false}
                  linkProps={{
                    className: `text-decoration-none ${
                      darkMode ? 'dark-mode-body' : 'light-mode-body'
                    }`,
                  }}
                  href={'/shop/' + shopId + '/' + br.breadcrumb}>
                  {br.breadcrumb.split('?')[0]}
                </BSBreadcrumb.Item>
              )
            );
          })}
      </BSBreadcrumb>
    </div>
  );
}
