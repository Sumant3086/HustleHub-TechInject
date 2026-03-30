'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import styles from './register.module.css';

export default function RegisterPage() {
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const generateSlug = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setTenantSlug(slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ tenantName, tenantSlug, email, password });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Register</h2>
        
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="tenantName">Company Name</label>
          <input
            id="tenantName"
            type="text"
            value={tenantName}
            onChange={(e) => {
              setTenantName(e.target.value);
              generateSlug(e.target.value);
            }}
            placeholder="Acme Inc"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="tenantSlug">Company Slug</label>
          <input
            id="tenantSlug"
            type="text"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            placeholder="acme-inc"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={8}
            required
          />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className={styles.link}>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}
