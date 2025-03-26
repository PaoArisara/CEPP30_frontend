import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load pages for performance
const Home = React.lazy(() => import('./pages/HomePage'));
const Detail = React.lazy(() => import('./pages/DetailPage'));
const Option = React.lazy(() => import('./pages/OptionsPage'));
const NotFound = React.lazy(() => import('./pages/NotFoundPage'));
const ListCar = React.lazy(() => import('./pages/ListCarPage'));

const Router: React.FC = () => {
  return (
    <React.Suspense fallback={<LoadingSpinner/>}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <MainLayout> 
                <Home />
              </MainLayout>
            } 
          />
          <Route 
            path="/detail" 
            element={
              <MainLayout> 
                <Detail />
              </MainLayout>
            } 
          />
          <Route 
            path="/option" 
            element={
              <MainLayout> 
                <Option />
              </MainLayout>
            } 
          />
          <Route 
            path="/listCar" 
            element={
              <MainLayout> 
                <ListCar />
              </MainLayout>
            } 
          />
          <Route 
            path="/notFound" 
            element={
              <MainLayout>  {/* Wrap NotFound component inside MainLayout */}
                <NotFound />
              </MainLayout>
            } 
          />
        </Routes>
      </BrowserRouter>
    </React.Suspense>
  );
};

export default Router;