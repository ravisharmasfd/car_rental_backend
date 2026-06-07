import * as userRoutes from './v1/userRoutes';
import * as fileRoutes from './v1/fileRoutes';

export const routes: any = [...userRoutes.default, ...fileRoutes.default];
