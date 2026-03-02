import { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/Login/LoginPage';
import Dashboard from './pages/Dashboard';
import Delegation from './pages/Delegation/Delegation';
import './index.css';
import Loader from './components/common/Loader';
import { Toaster } from 'react-hot-toast';
import { logout } from './store/slices/authSlice';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { checkAutoLogout } from './utils/autoLogout';


const DelegationDetail = lazy(() => import('./pages/Delegation/DelegationDetail'));
const Checklist = lazy(() => import('./pages/Checklist/Checklist'));
const HelpTicket = lazy(() => import('./pages/HelpTicket/HelpTicket'));
const DemoModule = lazy(() => import('./pages/DemoModule')); // Reusable Demo Page
const PublicPage = lazy(() => import('./pages/PublicPage')); // Reusable Public Page
const ToDoBoard = lazy(() => import('./pages/ToDo/ToDoBoard'));
const FMS = lazy (()=> import('./pages/MainFMS/FMSPage'));
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" replace />;
};



const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-bg-main">
    <Loader className="w-64 h-64" />
  </div>
);



function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    checkAutoLogout(dispatch, logout);

    const loginTime = localStorage.getItem('loginTime');

    if (!loginTime) return;

    const TEN_MIN = 8 * 60 * 60 * 1000;
    const remainingTime = TEN_MIN - (Date.now() - loginTime);

    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        dispatch(logout());
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [dispatch]);


  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          dispatch(logout());
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [dispatch]);

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#22c55e', // Bright Green
              color: '#ffffff',
              fontWeight: 'bold',
              border: '2px solid #166534',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444', // Bright Red
              color: '#ffffff',
              fontWeight: 'bold',
              border: '2px solid #991b1b',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#ef4444',
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delegation"
            element={
              <ProtectedRoute>
                <Delegation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delegation/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <DelegationDetail />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checklist"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Checklist />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <HelpTicket />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Demo Module Routes */}
          <Route path="/attendance" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><DemoModule type="attendance" /></Suspense></ProtectedRoute>} />
          <Route path="/salary" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><DemoModule type="salary" /></Suspense></ProtectedRoute>} />
          <Route path="/fms" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><FMS type="fms" /></Suspense></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><ToDoBoard /></Suspense></ProtectedRoute>} />
          <Route path="/ims" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><DemoModule type="ims" /></Suspense></ProtectedRoute>} />
          <Route path="/hrms" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><DemoModule type="hrms" /></Suspense></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><DemoModule type="profile" /></Suspense></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><DemoModule type="notifications" /></Suspense></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><DemoModule type="settings" /></Suspense></ProtectedRoute>} />
          <Route path="/help-demo" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><DemoModule type="help" /></Suspense></ProtectedRoute>} />

          {/* Public Pages */}
          <Route path="/help-center" element={<Suspense fallback={<LoadingFallback />}><PublicPage type="help-center" /></Suspense>} />
          <Route path="/contact-support" element={<Suspense fallback={<LoadingFallback />}><PublicPage type="contact-support" /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<LoadingFallback />}><PublicPage type="terms" /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<LoadingFallback />}><PublicPage type="privacy" /></Suspense>} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;