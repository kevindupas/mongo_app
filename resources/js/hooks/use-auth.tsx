import { User } from '@/types';
import { usePage } from '@inertiajs/react';

interface Auth {
    user: User;
    isAdmin: boolean;
}

export function useAuth(): Auth {
    const { auth } = usePage().props as any;
    const user = auth?.user || null;

    // Simple vérification basée sur le nom du rôle
    const isAdmin = user?.role?.name === 'admin';

    return { user, isAdmin };
}
