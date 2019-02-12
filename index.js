require('dotenv-extended').load(); // Expose environment variables on this document
const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const mongoParams = { useNewUrlParser: true, useCreateIndex: true };

// Handlers
const Lists = require('./handlers/subscriptions');
const ChimpHooks = require('./handlers/mailchimp.hooks');
const ChatbotHooks = require('./handlers/chatbot.hooks');
const Authentication = require('./handlers/authentication');
const Accounts = require('./handlers/users');
const Files = require('./handlers/files');

// Middlewares
const authBot = require('./middlewares/authChatbot');
const passportService = require('./libs/passport');
// const queryId = require('./middlewares/queryId');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });
const Multer = multer({ storage: Files.storage });

// app.use(config.fileParser.routes, bodyParser.json(config.fileParser.config));
// app.use(config.fileParser.routes, bodyParser.urlencoded(config.fileParser.config));

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cors());
passport.use(passportService.jwtLogin);
passport.use(passportService.localLogin);

mongoose.connect(process.env.DB_URL, mongoParams);
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/pipelines', Lists.status);

// Chatbot
app.post('/chatbot', authBot, ChatbotHooks.saveData);
app.post('/chatbot/user', authBot, ChatbotHooks.saveData);
app.post('/chatbot/indicacao', authBot, ChatbotHooks.saveData);

// Customers | Clients
app.post('/subscribe', Lists.subscribe);
app.get('/subscribers', requireAuth, Lists.subscribers);
app.get('/clients', requireAuth, Lists.byStatus);
app.get('/customers', requireAuth, Lists.byStatus);
app.get('/customer/:id', requireAuth, Lists.customer);
app.put('/customer/:id', requireAuth, Lists.customer);
app.delete('/customer/:id', requireAuth, Lists.deleteCustomer);

// Files
app.use('/uploads', express.static('uploads'));
app.post('/customer/:id/files', requireAuth, Multer.array('files'), Files.save);
app.delete('/customer/:id/files/:fileId', requireAuth, Files.delete);

// ChimpHooks
app.get('/hooks/email', (req, res) => res.status(200).send('OK'));
app.post('/hooks/email', ChimpHooks.chimpEventsHandler);

// Accounts
app.post('/signin', requireSignin, Authentication.signin);
app.post('/signup', Authentication.signup);
app.get('/accounts/:userID', requireAuth, Accounts.user);

server.listen(process.env.PORT, process.env.HOST, () => {
  console.info(`🖥️ Indenizou API up at: ${process.env.HOST}:${process.env.PORT}`);
});
