import { login } from './actions'
import { Activity } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">
            <Activity size={24} strokeWidth={2} />
          </div>
          <h1>GRX Intelligence</h1>
          <p className="text-secondary">Faça login para acessar o CRM</p>
        </div>
        
        <form className="login-form">
          <label htmlFor="email">E-mail</label>
          <input 
            className="crm-input"
            id="email" 
            name="email" 
            type="email" 
            placeholder="contato@grxintelligence.com"
            required 
          />
          
          <label htmlFor="password">Senha</label>
          <input 
            className="crm-input"
            id="password" 
            name="password" 
            type="password" 
            required 
          />
          
          <button formAction={login} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.75rem' }}>
            Entrar no Workspace
          </button>
        </form>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-body);
          padding: 1rem;
        }
        .login-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header .logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 12px;
          color: #fff;
          margin-bottom: 1rem;
        }
        .login-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .login-form label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
}
