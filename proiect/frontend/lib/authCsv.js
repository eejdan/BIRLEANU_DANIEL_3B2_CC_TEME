export const initialUsersCsv = `name,email,password,subscription
userfree,userfree@focusflow.local,1234,free
userpremium,userpremium@focusflow.local,4321,premium`;

export function parseUsersCsv(csv) {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((header) => header.trim());

  return rows
    .filter(Boolean)
    .map((row) => {
      const values = row.split(',').map((value) => value.trim());
      return headers.reduce((user, header, index) => {
        user[header] = values[index] ?? '';
        return user;
      }, {});
    });
}

export function usersToCsv(users) {
  const headers = ['name', 'email', 'password', 'subscription'];
  const rows = users.map((user) => headers.map((header) => user[header]).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function authenticateUser(users, identifier, password) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  return users.find(
    (user) =>
      (user.name.toLowerCase() === normalizedIdentifier ||
        user.email.toLowerCase() === normalizedIdentifier) &&
      user.password === password
  );
}

export function createFreeUser(users, form) {
  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();
  const password = form.password;
  const username = name || email.split('@')[0];
  const duplicate = users.some(
    (user) => user.name.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email
  );

  if (duplicate) {
    return { error: 'Exista deja un user cu acest nume sau email.' };
  }

  const user = {
    name: username,
    email,
    password,
    subscription: 'free'
  };

  return {
    user,
    users: [...users, user],
    csv: usersToCsv([...users, user])
  };
}

export function getInitials(name) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';
}
