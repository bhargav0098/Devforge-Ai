'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';

export default function ValidationIndicator() {
  const { nodes } = useProjectStore();
  
  const frontend = nodes.filter(n => n.data?.category === 'frontend');
  const backend = nodes.filter(n => n.data?.category === 'backend');
  const database = nodes.filter(n => n.data?.category === 'database');
  const service = nodes.filter(n => n.data?.category === 'service');
  
  const errors: string[] = [];
  
  if (frontend.length === 0) {
    errors.push('Add 1 frontend framework');
  } else if (frontend.length > 1) {
    errors.push('Remove extra frontends (max 1)');
  }
  
  if (backend.length === 0) {
    errors.push('Add 1 backend framework');
  } else if (backend.length > 1) {
    errors.push('Remove extra backends (max 1)');
  }
  
  if (database.length === 0) {
    errors.push('Add at least 1 database');
  } else if (database.length > 2) {
    errors.push('Remove extra databases (max 2)');
  }
  
  if (service.length > 3) {
    errors.push('Remove extra services (max 3)');
  }
  
  const isValid = errors.length === 0 && nodes.length >= 3;
  
  return (
    <div className={`glass-card p-4 border-2 transition-all duration-300 ${
      isValid ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
    }`}>
      <div className="flex items-center gap-3">
        <div className="text-3xl">{isValid ? '✅' : '⚠️'}</div>
        <div className="flex-1">
          {isValid ? (
            <div>
              <p className="text-white font-semibold text-lg">Valid Architecture</p>
              <p className="text-white/70 text-sm">
                {frontend.length} frontend • {backend.length} backend • {database.length} database • {service.length} services
              </p>
            </div>
          ) : (
            <div>
              <p className="text-red-400 font-semibold text-lg">Invalid Architecture</p>
              <div className="space-y-1 mt-2">
                {errors.map((err, idx) => (
                  <p key={idx} className="text-white/70 text-sm">• {err}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
