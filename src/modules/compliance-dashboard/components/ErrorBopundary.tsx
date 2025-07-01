// src/modules/compliance-dashboard/components/ErrorBoundary.tsx
import React from 'react';
import { Button } from '@/components/Button';

export class ErrorBoundary extends React.Component<{children:React.ReactNode}, {hasError:boolean}> {
  state = { hasError:false };
  static getDerivedStateFromError(){ return { hasError:true }; }
  componentDidCatch(e:any){ console.error(e); }
  render(){
    if(this.state.hasError){
      return (
        <div className="p-6 bg-red-100 rounded">
          <h4>😵‍💫 Oops, algo falló.</h4>
          <Button variant="outline" onClick={()=>this.setState({hasError:false})}>
            Reintentar
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
