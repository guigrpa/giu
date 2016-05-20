import http                 from 'http';
import { mainStory, chalk } from 'storyboard';
import express              from 'express';
import webpack              from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig        from './webpackConfig';

const PORT = 8080;

const expressApp = express();

if (!process.env.NODE_ENV === 'production') {
  const compiler = webpack(webpackConfig);
  expressApp.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    quiet: false,
    publicPath: webpackConfig.output.publicPath,
    stats: { colors: true },
  }));
  expressApp.use(webpackHotMiddleware(compiler));
}
expressApp.use(express.static(__dirname));

const httpServer = http.createServer(expressApp);
httpServer.listen(PORT);
mainStory.info('http', `Listening on port ${chalk.cyan.bold(PORT)}`);
