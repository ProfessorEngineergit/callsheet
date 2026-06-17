import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, type QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Generischer Echtzeit-Hook: abonniert eine Firestore-Sammlung via onSnapshot.
export function useCollection<T extends { id: string }>(
  path: string,
  ...constraints: QueryConstraint[]
): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Wir serialisieren die Constraints nicht – sie werden i.d.R. statisch übergeben.
  useEffect(() => {
    const q = query(collection(db, path), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { data, loading, error };
}
