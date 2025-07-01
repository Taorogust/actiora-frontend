// src/modules/compliance-dashboard/components/MetricsChart.tsx
import React, { useContext } from 'react';
import Chart from 'react-apexcharts';
import { ComplianceContext } from '../context/ComplianceContext';

export const MetricsChart: React.FC = () => {
  const { state, thresholds } = useContext(ComplianceContext);
  const details = state?.details_json || {};
  const modules = Object.keys(details);
  const series = modules.map(m => +(details[m]*100).toFixed(1));

  return (
    <Chart
      type="bar"
      series={[{ name:'Cumplimiento (%)', data: series }]}
      options={{
        chart:{ toolbar:{ show:false }},
        xaxis:{ categories: modules },
        yaxis:{ max:100, labels:{ formatter: v=>`${v}%`} },
        annotations:{
          yaxis:[
            { y: thresholds.yellow*100, borderColor:'orange', label:{ text:'Umbral Amarillo'}},
            { y: thresholds.green*100, borderColor:'green', label:{ text:'Umbral Verde'}},
          ]
        },
        tooltip:{ y:{ formatter: v=>`${v}%`} },
      }}
      height={350}
    />
  );
};
