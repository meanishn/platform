import React from 'react';
import { BarChart3 } from 'lucide-react';

export const TestSCSS: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>SCSS Test Page</h1>
        <p>Testing if SCSS styles are working</p>
      </div>
      
      <div className="grid cols-3 mb-6">
        <div className="stat-card">
          <div className="icon blue">
            <BarChart3 className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="content">
            <div className="label">Test Stat</div>
            <div className="value">123</div>
          </div>
        </div>
        
        <div className="glass-card">
          <h3>Glass Card</h3>
          <p>This should have glassmorphism effect</p>
        </div>
        
        <div className="card">
          <h3>Regular Card</h3>
          <p>This is a regular white card</p>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="btn primary">Primary Button</button>
          <button className="btn outline">Outline Button</button>
        </div>
      </div>
      
      <div className="grid cols-2 mb-6">
        <input className="form-input" placeholder="Test input field..." />
        <select className="form-select">
          <option>Test select</option>
          <option>Option 2</option>
        </select>
      </div>
    </div>
  );
};
