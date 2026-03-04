const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('Password@123', 10));
