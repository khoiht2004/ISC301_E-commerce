const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  USER: 'USER',
});

const ADMIN_STAFF_ROLES = [ROLES.ADMIN, ROLES.STAFF];

module.exports = {
  ROLES,
  ADMIN_STAFF_ROLES,
};
