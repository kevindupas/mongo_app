import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Trash } from 'lucide-react';
import { useState } from 'react';

interface Role {
    _id: string;
    name: string;
}

interface UsersPageProps {
    users: User[];
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Utilisateurs',
        href: '/admin/users',
    },
];

export default function UsersIndex({ users, roles }: UsersPageProps) {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        role_id: '',
    });

    const { delete: destroy } = useForm();

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setData({
            role_id: user.role_id || '',
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateRole = () => {
        if (!editingUser) return;

        post(route('admin.users.update-role', { user: editingUser._id }), {
            method: 'put',
            onSuccess: () => {
                reset();
                setIsEditDialogOpen(false);
                setEditingUser(null);
            },
        });
    };

    const handleDeleteUser = (userId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
            destroy(route('admin.users.destroy', { user: userId }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des utilisateurs" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Gestion des utilisateurs" description="Gérez les utilisateurs et leurs rôles" />

                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle>Utilisateurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead className="w-[120px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.role?.name === 'admin' ? 'bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}
                                            >
                                                {user.role?.name || 'Aucun rôle'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                                    Modifier
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user._id)}>
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Aucun utilisateur trouvé
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier le rôle de l'utilisateur</DialogTitle>
                            <DialogDescription>
                                {editingUser && (
                                    <span>
                                        Changer le rôle de <strong>{editingUser.name}</strong>
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label htmlFor="role" className="text-sm font-medium">
                                    Rôle
                                </label>
                                <Select value={data.role_id} onValueChange={(value) => setData('role_id', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role._id} value={role._id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role_id && <p className="text-sm text-red-500">{errors.role_id}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        reset();
                                        setEditingUser(null);
                                    }}
                                >
                                    Annuler
                                </Button>
                            </DialogClose>
                            <Button onClick={handleUpdateRole} disabled={processing}>
                                Mettre à jour
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
