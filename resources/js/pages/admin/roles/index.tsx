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
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

// Interface adaptée au format de données réel
interface Permission {
    // Peut être soit id, soit _id
    id?: string;
    _id?: string;
    name: string;
}

interface Role {
    id?: string;
    _id?: string;
    name: string;
    permissions: Permission[];
}

interface RolesPageProps {
    roles: Role[];
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Roles',
        href: '/admin/roles',
    },
];

// Helper pour obtenir l'ID quelle que soit sa forme
const getPermissionId = (permission: Permission | string): string => {
    if (typeof permission === 'string') return permission;
    // Retourne la première valeur non-undefined, ou une chaîne vide
    return String(permission.id || permission._id || '');
};

// Helper pour obtenir l'ID d'un rôle
const getRoleId = (role: Role): string => {
    if (typeof role === 'string') return role;
    return String(role.id || role._id || '');
};

export default function RolesIndex({ roles, permissions }: RolesPageProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Stocke les IDs des permissions sélectionnées pour l'édition
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

    // Formulaire d'ajout
    const addForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    // Formulaire d'édition séparé
    const editForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    const { delete: destroy } = useForm();

    // Vérifie si une permission est sélectionnée dans la liste actuelle
    const isPermissionSelected = (permission: Permission): boolean => {
        const permId = getPermissionId(permission);
        return selectedPermissionIds.includes(permId);
    };

    // Extrait les IDs de permission d'un rôle pour les utiliser dans le formulaire
    const extractPermissionIds = (role: Role): string[] => {
        return role.permissions
            .map((p) => {
                const id = getPermissionId(p);
                return id;
            })
            .filter((id) => id && id !== 'undefined' && id !== '[object Object]');
    };

    const handleAddRole = () => {
        addForm.post(route('admin.roles.store'), {
            onSuccess: () => {
                addForm.reset();
                setIsAddDialogOpen(false);
            },
        });
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);

        // Extraire UNIQUEMENT les IDs des permissions actuelles
        const permissionIds = extractPermissionIds(role);

        console.log('Rôle à éditer:', role.name);
        console.log('Permissions du rôle:', role.permissions);
        console.log("IDs des permissions extraites pour l'affichage:", permissionIds);

        // IMPORTANT: Mettre à jour l'état local et le formulaire
        setSelectedPermissionIds(permissionIds);
        editForm.setData({
            name: role.name,
            permissions: permissionIds,
        });

        setIsEditDialogOpen(true);
    };

    const handleUpdateRole = () => {
        if (!editingRole) return;

        // Utiliser l'ID du rôle
        const roleId = getRoleId(editingRole);

        if (!roleId) {
            console.error('Impossible de mettre à jour: ID du rôle manquant');
            return;
        }

        // S'assurer que les données de permissions sont bien des IDs
        console.log('Données avant nettoyage:', editForm.data);

        const cleanedPermissionIds = selectedPermissionIds.filter((id) => id && id !== 'undefined' && id !== '[object Object]');

        const cleanedData = {
            name: editForm.data.name,
            permissions: cleanedPermissionIds,
        };

        console.log('Envoi de la mise à jour:', {
            role: roleId,
            data: cleanedData,
        });

        // Utiliser router.put avec des données nettoyées
        router.put(route('admin.roles.update', { role: roleId }), cleanedData, {
            onSuccess: () => {
                editForm.reset();
                setSelectedPermissionIds([]);
                setIsEditDialogOpen(false);
                setEditingRole(null);
            },
            onError: (errors) => {
                console.error('Erreurs lors de la mise à jour:', errors);
            },
        });
    };

    const handleDeleteRole = (role: Role) => {
        const roleId = getRoleId(role);
        if (!roleId) {
            console.error('Impossible de supprimer: ID du rôle manquant');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle?')) {
            destroy(route('admin.roles.destroy', { role: roleId }));
        }
    };

    // Méthode pour gérer les clics sur les permissions pour l'ajout
    const toggleAddPermission = (permission: Permission) => {
        const permId = getPermissionId(permission);
        if (!permId) return; // Ignorer si pas d'ID

        const currentPermissions = [...addForm.data.permissions];

        if (currentPermissions.includes(permId)) {
            addForm.setData(
                'permissions',
                currentPermissions.filter((id) => id !== permId),
            );
        } else {
            addForm.setData('permissions', [...currentPermissions, permId]);
        }
    };

    // Méthode pour gérer les clics sur les permissions pour l'édition
    const toggleEditPermission = (permission: Permission) => {
        const permId = getPermissionId(permission);
        if (!permId) return; // Ignorer si pas d'ID

        console.log('Toggle permission:', permission.name, 'ID:', permId);

        // Mettre à jour l'état visuel des permissions sélectionnées
        if (selectedPermissionIds.includes(permId)) {
            // Retirer de la liste
            setSelectedPermissionIds((prev) => prev.filter((id) => id !== permId));
        } else {
            // Ajouter à la liste
            setSelectedPermissionIds((prev) => [...prev, permId]);
        }
    };

    // Synchroniser selectedPermissionIds avec le formulaire d'édition
    useEffect(() => {
        editForm.setData('permissions', selectedPermissionIds);
    }, [selectedPermissionIds]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des rôles" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Gestion des rôles" description="Créez et gérez les rôles utilisateurs" />

                    <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={(open) => {
                            setIsAddDialogOpen(open);
                            if (!open) addForm.reset();
                            if (open) addForm.reset(); // Réinitialiser aussi en ouvrant
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un rôle
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter un nouveau rôle</DialogTitle>
                                <DialogDescription>Définissez un nom et des permissions pour ce rôle.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom du rôle</Label>
                                    <Input
                                        id="name"
                                        value={addForm.data.name}
                                        onChange={(e) => addForm.setData('name', e.target.value)}
                                        placeholder="Nom du rôle"
                                    />
                                    {addForm.errors.name && <p className="text-sm text-red-500">{addForm.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Permissions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {permissions.map((permission, index) => {
                                            const permId = getPermissionId(permission);
                                            return (
                                                <button
                                                    key={`add-perm-${index}-${permId || 'unknown'}`}
                                                    type="button"
                                                    onClick={() => toggleAddPermission(permission)}
                                                    className={`rounded-md px-2 py-1 text-sm ${
                                                        addForm.data.permissions.includes(permId)
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                                    }`}
                                                >
                                                    {permission.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {addForm.errors.permissions && <p className="text-sm text-red-500">{addForm.errors.permissions}</p>}
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={() => addForm.reset()}>
                                        Annuler
                                    </Button>
                                </DialogClose>
                                <Button onClick={handleAddRole} disabled={addForm.processing}>
                                    Créer le rôle
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (!open) {
                                editForm.reset();
                                setSelectedPermissionIds([]);
                                setEditingRole(null);
                            }
                        }}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Modifier le rôle</DialogTitle>
                                <DialogDescription>Modifiez le nom et les permissions de ce rôle.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Nom du rôle</Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        placeholder="Nom du rôle"
                                    />
                                    {editForm.errors.name && <p className="text-sm text-red-500">{editForm.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Permissions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {permissions.map((permission, index) => {
                                            const permId = getPermissionId(permission);
                                            // Utiliser l'état local pour déterminer si la permission est sélectionnée
                                            const isSelected = selectedPermissionIds.includes(permId);

                                            return (
                                                <button
                                                    key={`edit-perm-${index}-${permId || 'unknown'}`}
                                                    type="button"
                                                    onClick={() => toggleEditPermission(permission)}
                                                    className={`rounded-md px-2 py-1 text-sm ${
                                                        isSelected
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                                    }`}
                                                >
                                                    {permission.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {editForm.errors.permissions && <p className="text-sm text-red-500">{editForm.errors.permissions}</p>}
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            editForm.reset();
                                            setSelectedPermissionIds([]);
                                            setEditingRole(null);
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                </DialogClose>
                                <Button onClick={handleUpdateRole} disabled={editForm.processing}>
                                    Mettre à jour
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle>Rôles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role, roleIndex) => (
                                    <TableRow key={`role-${roleIndex}-${getRoleId(role) || 'unknown'}`}>
                                        <TableCell className="font-medium">{role.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.map((permission, permIndex) => (
                                                    <span
                                                        key={`r${roleIndex}-p${permIndex}-${permission.name}`}
                                                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                    >
                                                        {permission.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                                                    Modifier
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role)}>
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {roles.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            Aucun rôle trouvé
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
