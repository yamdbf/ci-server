import { Server } from './server/Server';
import { Config } from './util/Config';

const server: Server = Server.instance();
server.start(Config.get('port'));
