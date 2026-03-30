'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1>Multi-Tenant Task Board</h1>
      <p>Organize your team&apos;s work with a simple, powerful task board</p>
      
      <div className={styles.actions}>
        {isAuthenticated ? (
          <button 
            className={styles.btnPrimary}
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </button>
        ) : (
          <>
            <button 
              className={styles.btnPrimary}
              onClick={() => router.push('/register')}
            >
              Get Started
            </button>
            <button 
              className={styles.btnSecondary}
              onClick={() => router.push('/login')}
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
