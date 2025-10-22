import { configureStore } from '@reduxjs/toolkit';
import emailsReducer from '../features/emails/emailsSlice';
import productReducer from '../features/products/productSlice'
import offersReducer from '../features/offers/offerSlice'
import authReducer from '../features/auth/authSlice'
import reportReducer from '../features/reports/reportSlice'

export const store = configureStore({
  reducer: {
    emails: emailsReducer,
    products: productReducer,
    offers: offersReducer,
    auth: authReducer,
    reports: reportReducer
  },
});

// Type helpers
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;