// src/modules/compliance-dashboard/components/TrafficLight.tsx
import React, { useContext } from 'react';
import { ComplianceContext } from '../context/ComplianceContext';
import { motion } from 'framer-motion';

export const TrafficLight: React.FC = () => {
  const { state, thresholds } = useContext(ComplianceContext);
  const val = state?.details_json;
  const color = state?.overall_status || 'Rojo';
  return (
    <motion.div
      className="p-4 rounded-lg flex items-center space-x-3"
      animate={{ backgroundColor:
        color==='Verde'? '#DCFCE7' :
        color==='Amarillo'? '#FEF9C3' : '#FEE2E2' }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="h-6 w-6 rounded-full"
        animate={{ scale: [0.8,1.2,1] }}
        style={{
          backgroundColor:
            color==='Verde'? '#16A34A' :
            color==='Amarillo'? '#CA8A04' : '#DC2626'
        }}
      />
      <h3 className="text-xl font-semibold">{state?.overall_status}</h3>
    </motion.div>
  );
};
