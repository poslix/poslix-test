import { getMyShopId, getmyUsername } from 'src/libs/loginlib';
import BusinessSettings from 'src/components/dashboard/BusinessSettings';
import AddLocation from 'src/components/dashboard/AddLocation';

const Locations = ({ username, businessId, pageType }: any) => {
  return (
    <>
      {pageType == 'settings' && (
        <BusinessSettings username={username} businessId={businessId}></BusinessSettings>
      )}
      {pageType == 'add' && <AddLocation username={username} businessId={businessId} />}
    </>
  );
};
export default Locations;
export function getServerSideProps(context: any) {
  let okUsername = true,
    okBusinessId = true,
    okSlug = true;

  let username = getmyUsername(context.query);
  if (username == undefined || username == '0') okUsername = false;

  let businessId = getMyShopId(context.query);
  if (businessId == undefined || businessId == 0) okBusinessId = false;

  var pageType = '';
  if (context.query.slug.length > 0) pageType = context.query.slug;

  if (pageType != 'add' && pageType != 'settings') okSlug = false;

  if (!okUsername || !okBusinessId || !okSlug)
    return { redirect: { permanent: false, destination: '/user/auth' } };

  return {
    props: { username, businessId, pageType },
  };
}
