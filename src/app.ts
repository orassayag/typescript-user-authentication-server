import { address } from 'ip';
import { BaseApp } from './shared/base-app';
import { authRoutes } from './routes/auth.routes';
import { serverConfig } from '../config';
import { testRoutes } from './routes/test.routes';
import { appRoutes } from './routes/app.routes';
import { userRoutes } from './routes/user.routes';
import { userRolesRoutes } from './routes/user-roles.routes';
import { verifyUserIsAdmin } from './middlewares/verify-user-is-admin.middleware';
import { adminRoutes } from './routes/admin.routes';

export class App extends BaseApp {
  public initRoutes() {
    super.initRoutes();
    if (!serverConfig.isProdEnv) {
      this.app.use('/test', testRoutes.router);
    }

    this.app.use('/auth', authRoutes.router);
    this.app.use('/api/userRoles', userRolesRoutes.router);

    this.app.use(verifyUserIsAdmin);
    this.app.use('/api/admin', adminRoutes.router);
    this.app.use('/api/user', userRoutes.router);
    this.app.use('/api/app', appRoutes.router);
  }

  getDbName() {
    return serverConfig.mongoDB.uaDatabase;
  }
}

module.exports = App;
