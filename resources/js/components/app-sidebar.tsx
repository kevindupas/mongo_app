import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Shield, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    // Utiliser le hook personnalisé
    const { isAdmin } = useAuth();

    // Les éléments de menu communs à tous les utilisateurs
    const commonNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    // Les éléments de menu réservés aux administrateurs
    const adminNavItems: NavItem[] = [
        {
            title: 'Utilisateurs',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'Rôles',
            href: '/admin/roles',
            icon: Shield,
        },
        {
            title: 'Permissions',
            href: '/admin/permissions',
            icon: Shield,
        },
    ];

    // Combiner les éléments de menu en fonction du rôle
    const mainNavItems = isAdmin ? [...commonNavItems, ...adminNavItems] : commonNavItems;

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
