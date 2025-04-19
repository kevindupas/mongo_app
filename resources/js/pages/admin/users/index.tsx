import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Role {
    id: string;
    name: string;
    permissions: any[];
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

// Helper function to get the ID
const getUserId = (user: User): string => {
    return String(user._id || user.id || '');
};

// Helper function to get the role ID
const getRoleId = (role: Role): string => {
    return String(role.id || role._id || '');
};

export default function UsersIndex({ users, roles }: UsersPageProps) {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

    // Default to first role ID if available
    const defaultRoleId = roles.length > 0 ? getRoleId(roles[0]) : '';

    // For controlling the role selections
    const [selectedRoleForEdit, setSelectedRoleForEdit] = useState('');
    const [selectedRoleForAdd, setSelectedRoleForAdd] = useState(defaultRoleId);

    // Form for adding new user
    const addForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: defaultRoleId, // Set the default role_id from the start
    });

    const { delete: destroy } = useForm();

    const handleEditUser = (user: User) => {
        console.log('Editing user:', user);
        setEditingUser(user);

        // Determine the current role ID
        const roleId = user.role_id || (user.role && user.role.id) || '';
        console.log('Current role ID:', roleId);

        // Set the selected role for the dropdown
        setSelectedRoleForEdit(roleId);
        setUpdateMessage('');

        setIsEditDialogOpen(true);
    };

    const handleUpdateRole = () => {
        if (!editingUser) return;

        setIsUpdating(true);
        setUpdateMessage('');

        const userId = getUserId(editingUser);

        // Use Inertia's router for the update - this handles CSRF automatically
        router.put(
            route('admin.users.update-role', { user: userId }),
            {
                role_id: selectedRoleForEdit,
            },
            {
                onSuccess: () => {
                    setUpdateMessage('Rôle mis à jour avec succès!');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                },
                onError: (errors) => {
                    setIsUpdating(false);
                    console.error('Error updating role:', errors);
                    if (errors.role_id) {
                        setUpdateMessage(`Erreur: ${errors.role_id}`);
                    } else {
                        setUpdateMessage('Erreur lors de la mise à jour du rôle');
                    }
                },
                onFinish: () => {
                    setIsUpdating(false);
                },
            },
        );
    };

    const handleAddUser = () => {
        // Update the role_id in the form before submission
        addForm.setData('role_id', selectedRoleForAdd);

        console.log('Creating user with data:', {
            ...addForm.data,
            role_id: selectedRoleForAdd,
        });

        // Submit the form
        addForm.post(route('admin.users.store'), {
            onSuccess: () => {
                console.log('User created successfully');
                addForm.reset();
                setIsAddDialogOpen(false);
                window.location.reload();
            },
            onError: (errors) => {
                console.error('Error creating user:', errors);
            },
        });
    };

    // Keep the form updated with the selected role
    useEffect(() => {
        addForm.setData('role_id', selectedRoleForAdd);
    }, [selectedRoleForAdd]);

    const handleDeleteUser = (user: User) => {
        const userId = getUserId(user);

        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
            destroy(route('admin.users.destroy', { user: userId }));
        }
    };

    // For debugging - show current roles
    useEffect(() => {
        console.log('Available roles:', roles);
        console.log('Default role ID:', defaultRoleId);

        roles.forEach((role) => {
            console.log(`Role ${role.name} has ID: ${getRoleId(role)}`);
        });

        // Log which role is currently selected for editing
        if (selectedRoleForEdit) {
            const selectedRole = roles.find((r) => getRoleId(r) === selectedRoleForEdit);
            console.log('Selected role for editing:', selectedRole);
        }
    }, [roles, selectedRoleForEdit, defaultRoleId]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des utilisateurs" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Gestion des utilisateurs" description="Gérez les utilisateurs et leurs rôles" />

                    <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={(open) => {
                            setIsAddDialogOpen(open);
                            if (!open) {
                                addForm.reset();
                                setSelectedRoleForAdd(defaultRoleId);
                                addForm.setData('role_id', defaultRoleId);
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un utilisateur
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                                <DialogDescription>Créez un nouvel utilisateur et assignez-lui un rôle.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        value={addForm.data.name}
                                        onChange={(e) => addForm.setData('name', e.target.value)}
                                        placeholder="Nom complet"
                                    />
                                    {addForm.errors.name && <p className="text-sm text-red-500">{addForm.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={addForm.data.email}
                                        onChange={(e) => addForm.setData('email', e.target.value)}
                                        placeholder="email@exemple.com"
                                    />
                                    {addForm.errors.email && <p className="text-sm text-red-500">{addForm.errors.email}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={addForm.data.password}
                                        onChange={(e) => addForm.setData('password', e.target.value)}
                                        placeholder="Mot de passe"
                                    />
                                    {addForm.errors.password && <p className="text-sm text-red-500">{addForm.errors.password}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={addForm.data.password_confirmation}
                                        onChange={(e) => addForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Confirmer le mot de passe"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="add-role">Rôle</Label>
                                    <select
                                        id="add-role"
                                        value={selectedRoleForAdd}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSelectedRoleForAdd(value);
                                            addForm.setData('role_id', value);
                                            console.log('Role for add changed to:', value);
                                        }}
                                        className="rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        {roles.map((role) => (
                                            <option key={getRoleId(role)} value={getRoleId(role)}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    {addForm.errors.role_id && <p className="text-sm text-red-500">{addForm.errors.role_id}</p>}
                                </div>

                                {/* Debug info for add form */}
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>Role ID selected: {selectedRoleForAdd}</p>
                                    <p>Form role_id: {addForm.data.role_id}</p>
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button onClick={handleAddUser} disabled={addForm.processing}>
                                    Créer l'utilisateur
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

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
                                    <TableRow key={getUserId(user)}>
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
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)}>
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

                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) {
                            setEditingUser(null);
                            setSelectedRoleForEdit('');
                            setUpdateMessage('');
                        }
                    }}
                >
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
                                <label htmlFor="edit-role" className="text-sm font-medium">
                                    Rôle actuel: {editingUser?.role?.name || 'Aucun'}
                                </label>
                                <select
                                    id="edit-role"
                                    value={selectedRoleForEdit}
                                    onChange={(e) => {
                                        console.log('Select changed to:', e.target.value);
                                        setSelectedRoleForEdit(e.target.value);
                                    }}
                                    className="rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800"
                                    disabled={isUpdating}
                                >
                                    <option value="" disabled>
                                        Sélectionnez un rôle
                                    </option>
                                    {roles.map((role) => {
                                        const roleId = getRoleId(role);
                                        return (
                                            <option key={roleId} value={roleId}>
                                                {role.name}
                                            </option>
                                        );
                                    })}
                                </select>

                                {updateMessage && (
                                    <div
                                        className={`mt-2 rounded p-2 text-sm ${
                                            updateMessage.startsWith('Erreur')
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                        }`}
                                    >
                                        {updateMessage}
                                    </div>
                                )}

                                {/* Debug info */}
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>ID de l'utilisateur: {editingUser ? getUserId(editingUser) : 'N/A'}</p>
                                    <p>ID du rôle actuel: {editingUser?.role_id || editingUser?.role?.id || 'N/A'}</p>
                                    <p>Rôle sélectionné: {selectedRoleForEdit || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isUpdating}>
                                    Annuler
                                </Button>
                            </DialogClose>
                            <Button onClick={handleUpdateRole} disabled={isUpdating}>
                                {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
