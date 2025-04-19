import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Users } from 'lucide-react';

interface DashboardProps {
    isAdmin: boolean;
    userCount?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ isAdmin, userCount }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {isAdmin ? <AdminDashboard userCount={userCount || 0} /> : <UserDashboard />}
            </div>
        </AppLayout>
    );
}

function AdminDashboard({ userCount }: { userCount: number }) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Utilisateurs</CardTitle>
                    <CardDescription>Nombre total d'utilisateurs inscrits</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span className="text-2xl font-bold">{userCount}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/users">Gérer les utilisateurs</Link>
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Rôles</CardTitle>
                    <CardDescription>Gérer les rôles et les permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Configurez les rôles et les niveaux d'accès</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/roles">Gérer les rôles</Link>
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Permissions</CardTitle>
                    <CardDescription>Gérer les permissions système</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Configurez les permissions disponibles</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/permissions">Gérer les permissions</Link>
                    </Button>
                </CardFooter>
            </Card>

            <div className="border-sidebar-border/70 dark:border-sidebar-border relative col-span-full min-h-[40vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
            </div>
        </div>
    );
}

function UserDashboard() {
    return (
        <div className="flex h-full flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Bienvenue sur votre tableau de bord</CardTitle>
                    <CardDescription>Vous êtes connecté en tant qu'utilisateur standard</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Votre espace utilisateur vous permet de gérer vos informations personnelles.</p>
                </CardContent>
            </Card>

            <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
            </div>
        </div>
    );
}
