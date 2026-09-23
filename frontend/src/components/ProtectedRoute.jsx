import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if their role is allowed for this page (case-insensitive comparison)
  // DB stores roles as lowercase ('admin', 'boss') but some code uses capitalized ('Admin', 'Boss')
  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes((user.role || '').toLowerCase())) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default ProtectedRoute;