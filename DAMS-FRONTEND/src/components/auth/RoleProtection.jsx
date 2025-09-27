import React from 'react';
import { useAuth } from '../../context/AuthContext';

const RoleProtection = ({ 
  children, 
  allowedRoles = [], 
  requiredRole = null, 
  fallback = null,
  hideIfUnauthorized = false 
}) => {
  const { user, role } = useAuth();

  // If user is not authenticated, return fallback or hide
  if (!user || !role) {
    return hideIfUnauthorized ? null : (fallback || <div>Access denied</div>);
  }

  // Check if user has required role
  if (requiredRole && role !== requiredRole) {
    return hideIfUnauthorized ? null : (fallback || <div>Access denied</div>);
  }

  // Check if user role is in allowed roles array
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return hideIfUnauthorized ? null : (fallback || <div>Access denied</div>);
  }

  // User has access, render children
  return <>{children}</>;
};

// Helper hook for checking roles in components
export const useRoleAccess = () => {
  const { user, role } = useAuth();

  const hasRole = (requiredRole) => {
    return user && role && role === requiredRole;
  };

  const hasAnyRole = (allowedRoles) => {
    return user && role && allowedRoles.includes(role);
  };

  const isAdmin = () => {
    // Only the fixed admin email can have admin access
    return user && role === 'admin' && user.email === 'admin@hospital.com';
  };

  const isPatient = () => {
    // If no role is specified but user is logged in, default to patient
    if (user && !role) return true;
    return hasRole('patient') || hasRole('user');
  };

  const canBookAppointments = () => {
    // Only patients/users can book appointments
    // If no role is set, default to patient (for backward compatibility)
    return isPatient() || (!role && user);
  };

  const canManageDoctors = () => {
    // Only admins can add/edit/delete doctors
    return isAdmin();
  };

  const canViewDoctorDetails = () => {
    // Everyone can view doctor details
    return user && role;
  };

  return {
    user,
    role,
    hasRole,
    hasAnyRole,
    isAdmin,
    isPatient,
    canBookAppointments,
    canManageDoctors,
    canViewDoctorDetails
  };
};

export default RoleProtection;
