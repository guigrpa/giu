import path                 from 'path';
import http                 from 'http';
import { mainStory, chalk } from 'storyboard';
import express              from 'express';

const PORT = 8080;
const expressApp = express();
expressApp.use(express.static(__dirname));
const httpServer = http.createServer(expressApp);
httpServer.listen(PORT);
mainStory.info('http', `Listening on port ${chalk.cyan.bold(PORT)}`);
