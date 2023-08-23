/**
 * map the permssion string that comes from the BE to object
 */
export default function permissionStrToObj(permissionStr: string): Record<string, string[]> {
  const permissions = {};

  const permissionArray = permissionStr?.split(',');

  permissionArray.forEach((item) => {
    const [category, permissionItem] = item.split('/');

    if (category && permissionItem) {
      if (Array.isArray(permissions[category])) {
        permissions[category].push(permissionItem);
      } else {
        permissions[category] = [permissionItem];
      }
    }
  });

  return permissions;
}
