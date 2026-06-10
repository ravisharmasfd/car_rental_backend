import * as userRoutes from './v1/userRoutes';
import * as fileRoutes from './v1/fileRoutes';
import * as carRoutes from './v1/carRoutes';
import * as invoiceRoutes from './v1/invoiceRoutes';
import * as contactRoutes from './v1/contactRoutes';

export const routes: any = [...userRoutes.default, ...fileRoutes.default, ...carRoutes.default, ...invoiceRoutes.default, ...contactRoutes.default];
