import * as userRoutes from './v1/userRoutes';
import * as fileRoutes from './v1/fileRoutes';
import * as carRoutes from './v1/carRoutes';

export const routes: any = [...userRoutes.default, ...fileRoutes.default, ...carRoutes.default];
