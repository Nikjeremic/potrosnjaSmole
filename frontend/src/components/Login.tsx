import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(username, password);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Greška pri prijavi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-login-container-subtle">
      <Card className="custom-login-card">
        <div className="custom-title">
          <h2>Potrošnja Smole</h2>
        </div>
        <div className="custom-subtitle">
          <h4>Prijavite se u sistem</h4>
        </div>
        
        {error && (
          <Message severity="error" text={error} className="mb-3" />
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="field mb-3">
            <label htmlFor="username" className="block mb-2">Korisničko ime</label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              placeholder="Unesite korisničko ime"
              required
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="password" className="block mb-2">Lozinka</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="Unesite lozinku"
              feedback={false}
              toggleMask
              required
            />
          </div>

          <Button 
            type="submit"
            label="Prijavi se"
            loading={loading}
            className="w-full"
            severity="info"
          />
        </form>
      </Card>
    </div>
  );
};

export default Login;
