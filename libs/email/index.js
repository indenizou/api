const fs = require('fs');
const spark = require('sparkpost');
const mustache = require('mustache');
const i18n = require('./i18n').pt_BR;
const newUserTemplate = fs.readFileSync(__dirname + '/templates/newUser.html', 'utf-8');
const resetPasswordTemplate = fs.readFileSync(__dirname + '/templates/resetPassword.html', 'utf-8');
const userInviteTemplate = fs.readFileSync(__dirname + '/templates/userInvite.html', 'utf-8');

const mail = new spark(process.env.SPARKPOST_KEY);
const URL = process.env.APP_URL;
const callback = () => null;
const from = {
  email: 'contato@indenizou.com',
  name: 'Indenizou.com',
};

module.exports = () => ({
  resetPasswordLink: (email, token) => {
    const view = { i18n, token, URL };

    return mail.transmissions.send({
      content: {
        from,
        subject: i18n.reset_subject,
        html: mustache.render(resetPasswordTemplate, view),
      },
      recipients: [{ address: email }],
    }, callback);
  },

  inviteNewUser: (email, password) => {
    const view = {
      i18n,
      email,
      password,
      URL,
    };

    return mail.transmissions.send({
      content: {
        from,
        subject: i18n.new_user_subject,
        html: mustache.render(newUserTemplate, view),
      },
      recipients: [{ address: email }],
    }, callback);
  },

  inviteUser: (email) => {
    const view = {
      i18n,
      email,
      URL,
    };

    return mail.transmissions.send({
      content: {
        from,
        subject: i18n.invite_to_manage_subject,
        html: mustache.render(userInviteTemplate, view),
      },
      recipients: [{ address: email }],
    }, callback);
  }
});
