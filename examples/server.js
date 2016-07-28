import http                 from 'http';
import { mainStory, chalk } from 'storyboard/lib/withConsoleListener';
import express              from 'express';

const PORT = 8080;
const expressApp = express();
expressApp.use(express.static(__dirname));
const httpServer = http.createServer(expressApp);
httpServer.listen(PORT);
mainStory.info('http', `Listening on port ${chalk.cyan.bold(PORT)}`);
mainStory.info('http', `Check out: http://localhost:${PORT}/public/demo1.html`);
mainStory.info('http', `Check out: http://localhost:${PORT}/public/index.html`);
mainStory.info('http', 'Both examples above run after `npm run buildExamplesSsrDev`');
mainStory.info('http', 'The first example works also with the simpler `npm run buildExamplesDev`');
